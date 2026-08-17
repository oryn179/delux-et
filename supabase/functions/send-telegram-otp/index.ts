import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { telegram_id, action, code } = await req.json()
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) throw new Error('Unauthorized')

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) throw profileError
    if (!profile) {
      // Auto-create profile if missing
      const { data: newProfile, error: createError } = await supabaseClient
        .from('profiles')
        .insert({ id: user.id })
        .select()
        .single()
      
      if (createError) throw new Error('Failed to create user profile')
      profile = newProfile
    }

    // Check suspension
    if (profile.otp_suspended_until && new Date(profile.otp_suspended_until) > new Date()) {
      const suspensionRemaining = Math.ceil((new Date(profile.otp_suspended_until).getTime() - new Date().getTime()) / 60000)
      return new Response(
        JSON.stringify({ error: `Account suspended. Try again in ${suspensionRemaining} minutes.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    if (action === 'send') {
      // Generate 6-digit code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 60000).toISOString() // 60 seconds

      // Update profile with code
      await supabaseClient
        .from('profiles')
        .update({
          telegram_id,
          otp_code: otpCode,
          otp_expires_at: expiresAt
        })
        .eq('id', user.id)

      // Send to Telegram
      const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
      if (botToken) {
        const message = `Your DELUX verification code is: ${otpCode}. It expires in 60 seconds.`
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegram_id, // Assuming telegram_id is the chat_id for now
            text: message
          })
        })
      }

      return new Response(
        JSON.stringify({ message: 'Code sent successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (action === 'verify') {
      if (!profile.otp_code || !profile.otp_expires_at) {
        throw new Error('No active code found')
      }

      // Check expiration
      if (new Date(profile.otp_expires_at) < new Date()) {
        throw new Error('Code expired')
      }

      if (profile.otp_code === code) {
        // Success
        await supabaseClient
          .from('profiles')
          .update({
            verified: true,
            otp_code: null,
            otp_expires_at: null,
            otp_failed_attempts: 0
          })
          .eq('id', user.id)

        return new Response(
          JSON.stringify({ message: 'Verification successful' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      } else {
        // Fail
        const newAttempts = (profile.otp_failed_attempts || 0) + 1
        let suspendedUntil = null
        
        if (newAttempts >= 7) {
          suspendedUntil = new Date(Date.now() + (90 * 60 * 1000)).toISOString() // 1 hour 30 mins
        }

        await supabaseClient
          .from('profiles')
          .update({
            otp_failed_attempts: newAttempts,
            otp_suspended_until: suspendedUntil
          })
          .eq('id', user.id)

        const errorMsg = newAttempts >= 7 
          ? 'Too many failed attempts. Account suspended for 1 hour 30 minutes.' 
          : 'Invalid code'

        return new Response(
          JSON.stringify({ error: errorMsg }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    }

    throw new Error('Invalid action')

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
