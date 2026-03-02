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
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, email, token, userId } = await req.json();

    if (action === 'send') {
      // Generate a secure token
      const verifyToken = crypto.randomUUID();
      
      // Store token in profiles table via verification_method field temporarily
      // We'll use a dedicated approach: store token in system_settings
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Store verification token with expiry
      await supabase.from('system_settings').upsert({
        key: `email_verify_${email}`,
        value: { token: verifyToken, expires_at: Date.now() + 30 * 60 * 1000 },
        description: 'Email verification token',
      }, { onConflict: 'key' });

      // Build verification link
      const origin = req.headers.get('origin') || 'https://delux-et.lovable.app';
      const verifyLink = `${origin}/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;

      // Send via Resend
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Delux <onboarding@resend.dev>',
          to: [email],
          subject: 'Verify Your Delux Account',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;">
              <h1 style="color:#1a1a1a;font-size:24px;margin-bottom:8px;">Verify Your Delux Account</h1>
              <p style="color:#666;font-size:14px;margin-bottom:24px;">Click the button below to verify your email address. This link expires in 30 minutes.</p>
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${verifyLink}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
                  ✅ Verify My Account
                </a>
              </div>
              <p style="color:#999;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
              <p style="color:#ccc;font-size:11px;margin-top:16px;">Or copy this link: ${verifyLink}</p>
            </div>
          `,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Resend error:', data);
        return new Response(
          JSON.stringify({ success: false, error: data.message || 'Failed to send email' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'verify') {
      // Verify the token from the link
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: setting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', `email_verify_${email}`)
        .maybeSingle();

      if (!setting) {
        return new Response(
          JSON.stringify({ success: false, error: 'Verification link expired or not found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const stored = setting.value as { token: string; expires_at: number };

      if (Date.now() > stored.expires_at) {
        await supabase.from('system_settings').delete().eq('key', `email_verify_${email}`);
        return new Response(
          JSON.stringify({ success: false, error: 'Verification link has expired' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (stored.token !== token) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid verification link' }),
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

      // Clean up token
      await supabase.from('system_settings').delete().eq('key', `email_verify_${email}`);

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
    console.error('Verification email error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
