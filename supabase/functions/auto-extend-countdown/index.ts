import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get the current countdown settings
    const { data: currentSettings, error: fetchError } = await supabaseAdmin
      .from('countdown_timer')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchError) throw fetchError

    if (!currentSettings || !currentSettings.enabled) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No active countdown found' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Check if the countdown has expired
    const targetDate = new Date(currentSettings.target_date)
    const now = new Date()

    if (now >= targetDate) {
      // Extend by 24 hours
      const newTargetDate = new Date(targetDate)
      newTargetDate.setDate(newTargetDate.getDate() + 1)

      const { error: updateError } = await supabaseAdmin
        .from('countdown_timer')
        .update({
          target_date: newTargetDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSettings.id)

      if (updateError) throw updateError

      console.log(`Countdown extended to: ${newTargetDate.toISOString()}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Countdown extended by 24 hours',
          new_target: newTargetDate.toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Countdown has not expired yet' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error extending countdown:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
