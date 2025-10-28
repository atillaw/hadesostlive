import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const merchant_oid = formData.get('merchant_oid') as string;
    const status = formData.get('status') as string;
    const total_amount = formData.get('total_amount') as string;
    const hash = formData.get('hash') as string;

    console.log('[PayTR Callback] Received:', { merchant_oid, status, total_amount });

    const merchantSalt = Deno.env.get('PAYTR_MERCHANT_SALT') || '';

    // Hash doğrulama
    const calculatedHash = await generateHash(merchant_oid, merchantSalt, status, total_amount);
    
    if (hash !== calculatedHash) {
      console.error('[PayTR Callback] Hash mismatch!');
      return new Response('OK', { status: 200 }); // PayTR'ye OK döndür ama işleme devam etme
    }

    if (status === 'success') {
      console.log('[PayTR Callback] Payment successful!');
      
      // Burada kullanıcıya puan eklenecek
      // Supabase'e impact_points tablosu oluşturulduktan sonra buraya eklenecek
      
      // Şimdilik sadece log
      const points = Math.round(parseFloat(total_amount) / 100);
      console.log(`[PayTR Callback] User should receive ${points} points`);
      
      return new Response('OK', { 
        status: 200,
        headers: corsHeaders 
      });
    } else {
      console.log('[PayTR Callback] Payment failed or cancelled');
      return new Response('OK', { 
        status: 200,
        headers: corsHeaders 
      });
    }

  } catch (error) {
    console.error('[PayTR Callback] Error:', error);
    return new Response('OK', { 
      status: 200,
      headers: corsHeaders 
    });
  }
});

async function generateHash(
  merchant_oid: string,
  merchant_salt: string,
  status: string,
  total_amount: string
): Promise<string> {
  const hashStr = merchant_oid + merchant_salt + status + total_amount;
  const encoder = new TextEncoder();
  const data = encoder.encode(hashStr);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
