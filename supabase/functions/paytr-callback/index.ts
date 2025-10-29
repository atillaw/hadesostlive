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
      
      // Supabase client oluştur
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      );

      try {
        // Transaction'ı güncelle
        const { data: transaction, error: transactionError } = await supabaseAdmin
          .from('paytr_transactions')
          .update({
            status: 'success',
            payment_date: new Date().toISOString()
          })
          .eq('merchant_oid', merchant_oid)
          .select()
          .single();

        if (transactionError) {
          console.error('[PayTR Callback] Transaction update error:', transactionError);
        } else if (transaction) {
          console.log('[PayTR Callback] Transaction updated:', transaction);

          // Kullanıcının impact_points kaydını kontrol et ve güncelle
          const { data: existingPoints, error: pointsCheckError } = await supabaseAdmin
            .from('impact_points')
            .select('*')
            .eq('user_email', transaction.user_email)
            .maybeSingle();

          if (pointsCheckError) {
            console.error('[PayTR Callback] Points check error:', pointsCheckError);
          } else if (existingPoints) {
            // Mevcut puana ekle
            const { error: updateError } = await supabaseAdmin
              .from('impact_points')
              .update({
                total_points: existingPoints.total_points + transaction.points,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingPoints.id);

            if (updateError) {
              console.error('[PayTR Callback] Points update error:', updateError);
            } else {
              console.log('[PayTR Callback] Points added successfully!');
            }
          } else {
            // Yeni kayıt oluştur
            const { error: insertError } = await supabaseAdmin
              .from('impact_points')
              .insert({
                user_id: transaction.user_id,
                user_email: transaction.user_email,
                total_points: transaction.points
              });

            if (insertError) {
              console.error('[PayTR Callback] Points insert error:', insertError);
            } else {
              console.log('[PayTR Callback] New points record created!');
            }
          }
        }
      } catch (error) {
        console.error('[PayTR Callback] Database error:', error);
      }

      return new Response('OK', { 
        status: 200,
        headers: corsHeaders 
      });
    } else {
      console.log('[PayTR Callback] Payment failed or cancelled');
      
      // Transaction'ı failed olarak güncelle
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      );

      await supabaseAdmin
        .from('paytr_transactions')
        .update({
          status: 'failed',
          payment_date: new Date().toISOString()
        })
        .eq('merchant_oid', merchant_oid);

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
