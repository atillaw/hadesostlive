import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { predictionId } = await req.json();
    
    console.log('Calculating rewards for prediction:', predictionId);

    // Get prediction game details
    const { data: prediction, error: predictionError } = await supabase
      .from('prediction_games')
      .select('*')
      .eq('id', predictionId)
      .single();

    if (predictionError) {
      console.error('Error fetching prediction:', predictionError);
      throw predictionError;
    }

    if (!prediction || prediction.correct_option_index === null) {
      return new Response(
        JSON.stringify({ error: 'No correct answer set for this prediction' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all bets for this prediction
    const { data: bets, error: betsError } = await supabase
      .from('prediction_bets')
      .select('*')
      .eq('prediction_id', predictionId);

    if (betsError) {
      console.error('Error fetching bets:', betsError);
      throw betsError;
    }

    if (!bets || bets.length === 0) {
      console.log('No bets found for this prediction');
      return new Response(
        JSON.stringify({ message: 'No bets to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total wagered
    const totalWagered = bets.reduce((sum, bet) => sum + bet.points_wagered, 0);
    
    // Get winning bets
    const winningBets = bets.filter(bet => bet.option_index === prediction.correct_option_index);
    const totalWinningWagered = winningBets.reduce((sum, bet) => sum + bet.points_wagered, 0);

    console.log(`Total wagered: ${totalWagered}, Winning bets: ${winningBets.length}, Total winning wagered: ${totalWinningWagered}`);

    // Update each bet with points won
    const updates = [];
    for (const bet of bets) {
      const isWinner = bet.option_index === prediction.correct_option_index;
      let pointsWon = 0;

      if (isWinner && totalWinningWagered > 0) {
        // Winner gets their stake back plus a share of losing bets
        const losingPool = totalWagered - totalWinningWagered;
        const share = bet.points_wagered / totalWinningWagered;
        pointsWon = bet.points_wagered + Math.floor(losingPool * share);
      }

      updates.push(
        supabase
          .from('prediction_bets')
          .update({ points_won: pointsWon })
          .eq('id', bet.id)
      );
    }

    await Promise.all(updates);

    console.log(`Successfully calculated rewards for ${bets.length} bets`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalBets: bets.length,
        winners: winningBets.length,
        totalWagered,
        message: 'Rewards calculated successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in calculate-prediction-rewards:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
