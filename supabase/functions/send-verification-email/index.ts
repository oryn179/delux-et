import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Simple in-memory store for verification codes (per instance)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

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

    const { action, email, code } = await req.json();

    if (action === 'send') {
      // Generate 6-digit code
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store code with 10 min expiry
      verificationCodes.set(email, {
        code: verifyCode,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

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
          subject: 'Your Delux Verification Code',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;">
              <h1 style="color:#1a1a1a;font-size:24px;margin-bottom:8px;">Verify Your Delux Account</h1>
              <p style="color:#666;font-size:14px;margin-bottom:24px;">Use the code below to complete your verification. It expires in 10 minutes.</p>
              <div style="background:#f4f4f5;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
                <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a1a1a;">${verifyCode}</span>
              </div>
              <p style="color:#999;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
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
      const stored = verificationCodes.get(email);
      
      if (!stored || Date.now() > stored.expiresAt) {
        verificationCodes.delete(email);
        return new Response(
          JSON.stringify({ success: false, error: 'Code expired or not found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (stored.code !== code) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      verificationCodes.delete(email);
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
