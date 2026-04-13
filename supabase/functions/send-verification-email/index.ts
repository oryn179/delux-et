import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, email, code: userCode, userId } = await req.json();

    if (action === 'send') {
      // Generate a 6-digit OTP code
      const code = String(Math.floor(100000 + Math.random() * 900000));

      // Store code with 10-minute expiry
      await supabase.from('system_settings').upsert({
        key: `email_otp_${email}`,
        value: { code, expires_at: Date.now() + 10 * 60 * 1000 },
        description: 'Email verification OTP',
      }, { onConflict: 'key' });

      // Try to send via Resend if configured
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      let emailSent = false;

      if (RESEND_API_KEY) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Delux <onboarding@resend.dev>',
              to: [email],
              subject: 'Your Delux Verification Code',
              html: `
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;">
                  <h1 style="color:#1a1a1a;font-size:24px;margin-bottom:8px;">Your Verification Code</h1>
                  <p style="color:#666;font-size:14px;margin-bottom:24px;">Enter this code on the Delux verification page. It expires in 10 minutes.</p>
                  <div style="text-align:center;margin-bottom:24px;">
                    <div style="display:inline-block;background:#f4f4f5;padding:16px 32px;border-radius:12px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a1a1a;">
                      ${code}
                    </div>
                  </div>
                  <p style="color:#999;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
                </div>
              `,
            }),
          });

          if (res.ok) {
            emailSent = true;
          } else {
            const errData = await res.json();
            console.error('Resend error (non-fatal):', errData);
          }
        } catch (e) {
          console.error('Resend send failed (non-fatal):', e);
        }
      }

      // Log the code for debugging (visible in edge function logs)
      console.log(`Verification code for ${email}: ${code}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          emailSent,
      // Never expose verification codes in the response
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'verify') {
      const { data: setting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', `email_otp_${email}`)
        .maybeSingle();

      if (!setting) {
        return new Response(
          JSON.stringify({ success: false, error: 'No verification code found. Please request a new one.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const stored = setting.value as { code: string; expires_at: number };

      if (Date.now() > stored.expires_at) {
        await supabase.from('system_settings').delete().eq('key', `email_otp_${email}`);
        return new Response(
          JSON.stringify({ success: false, error: 'Code has expired. Please request a new one.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (stored.code !== userCode) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid verification code.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mark user as verified
      if (userId) {
        await supabase.from('profiles').update({
          verified: true,
          email_verified: true,
          verification_method: 'email',
        }).eq('user_id', userId);
      }

      // Clean up
      await supabase.from('system_settings').delete().eq('key', `email_otp_${email}`);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
