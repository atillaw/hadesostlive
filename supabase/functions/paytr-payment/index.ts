import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, userEmail, userName } = await req.json();

    console.log('[PayTR] Payment request received:', { amount, userEmail, userName });

    // PayTR credentials - kullanıcı bunları daha sonra secrets olarak girecek
    const merchantId = Deno.env.get('PAYTR_MERCHANT_ID') || '';
    const merchantKey = Deno.env.get('PAYTR_MERCHANT_KEY') || '';
    const merchantSalt = Deno.env.get('PAYTR_MERCHANT_SALT') || '';

    if (!merchantId || !merchantKey || !merchantSalt) {
      console.error('[PayTR] Missing credentials');
      return new Response(
        JSON.stringify({ 
          error: 'PayTR ayarları eksik. Lütfen yönetici ile iletişime geçin.' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Sipariş ID oluştur
    const merchantOid = `IP${Date.now()}`;
    
    // PayTR'ye gönderilecek parametreler
    const paymentAmount = Math.round(parseFloat(amount) * 100); // Kuruş cinsinden
    const userBasket = JSON.stringify([
      ['Impact Points', `${amount} TL`, 1]
    ]);
    
    const noInstallment = '0'; // Taksit yok
    const maxInstallment = '0';
    const currency = 'TL';
    const testMode = '1'; // Test modu - production'da '0' yapılacak
    
    // Callback URLs - bu site'ın URL'ini kullan
    const merchantOkUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/paytr-callback`;
    const merchantFailUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/paytr-callback`;
    
    // Timeout limit (saniye)
    const timeoutLimit = '30';
    
    // Debug açık
    const debugOn = '1';
    
    // Lang
    const lang = 'tr';

    // Hash oluştur
    const hashStr = `${merchantId}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`;
    const paytrToken = await createPayTRHash(hashStr, merchantKey, merchantSalt, merchantOid, paymentAmount);

    console.log('[PayTR] Token generated, preparing iframe request');

    // PayTR'ye iframe token istegi gönder
    const paytrData = new URLSearchParams({
      merchant_id: merchantId,
      user_ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
      merchant_oid: merchantOid,
      email: userEmail,
      payment_amount: paymentAmount.toString(),
      paytr_token: paytrToken,
      user_basket: userBasket,
      debug_on: debugOn,
      no_installment: noInstallment,
      max_installment: maxInstallment,
      user_name: userName,
      user_address: 'N/A',
      user_phone: '0000000000',
      merchant_ok_url: merchantOkUrl,
      merchant_fail_url: merchantFailUrl,
      timeout_limit: timeoutLimit,
      currency: currency,
      test_mode: testMode,
      lang: lang,
    });

    console.log('[PayTR] Sending request to PayTR API');

    const paytrResponse = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: paytrData.toString(),
    });

    const responseText = await paytrResponse.text();
    console.log('[PayTR] Response received:', responseText);

    const paytrResult = JSON.parse(responseText);

    if (paytrResult.status === 'success') {
      console.log('[PayTR] Token successfully generated');
      return new Response(
        JSON.stringify({ 
          token: paytrResult.token,
          merchantOid: merchantOid
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      console.error('[PayTR] Token generation failed:', paytrResult);
      return new Response(
        JSON.stringify({ 
          error: paytrResult.reason || 'Ödeme başlatılamadı' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('[PayTR] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return new Response(
      JSON.stringify({ 
        error: 'Ödeme işlemi sırasında bir hata oluştu',
        details: errorMessage 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// PayTR hash oluşturma fonksiyonu
async function createPayTRHash(
  baseString: string, 
  merchantKey: string, 
  merchantSalt: string,
  merchantOid: string,
  paymentAmount: number
): Promise<string> {
  const hashData = `${merchantOid}${baseString}${paymentAmount}`;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(hashData + merchantSalt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}
