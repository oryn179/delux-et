import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, action, listingTitle, reason } = await req.json();

    if (!userId || !action) throw new Error("Missing required fields");

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData?.user?.email) throw new Error("User email not found");

    const email = userData.user.email;
    const { data: profile } = await supabase.from("profiles").select("name").eq("user_id", userId).maybeSingle();
    const name = profile?.name || "User";

    let subject = "";
    let html = "";

    if (action === "listing_approved") {
      subject = `Your listing "${listingTitle}" has been approved! 🎉`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#16a34a,#22c55e);color:white;padding:20px;border-radius:8px 8px 0 0;">
            <h1 style="margin:0;">🎉 Listing Approved!</h1>
          </div>
          <div style="background:#f9fafb;padding:20px;border-radius:0 0 8px 8px;">
            <p>Hello ${name},</p>
            <p>Great news! Your listing <strong>"${listingTitle}"</strong> has been approved and is now visible to everyone on Delux.</p>
            <p>Home seekers can now find and contact you about this property.</p>
            <p style="color:#666;font-size:12px;margin-top:20px;">— The Delux Team</p>
          </div>
        </div>`;
    } else if (action === "listing_rejected") {
      subject = `Your listing "${listingTitle}" was not approved`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#dc2626;color:white;padding:20px;border-radius:8px 8px 0 0;">
            <h1 style="margin:0;">Listing Not Approved</h1>
          </div>
          <div style="background:#f9fafb;padding:20px;border-radius:0 0 8px 8px;">
            <p>Hello ${name},</p>
            <p>Unfortunately, your listing <strong>"${listingTitle}"</strong> was not approved.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
            <p>Please review and try again, or contact our support team for help.</p>
            <p style="color:#666;font-size:12px;margin-top:20px;">— The Delux Team</p>
          </div>
        </div>`;
    } else if (action === "owner_approved") {
      subject = "Your Home Owner request has been approved! 🎉";
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#16a34a,#22c55e);color:white;padding:20px;border-radius:8px 8px 0 0;">
            <h1 style="margin:0;">🎉 Welcome, Home Owner!</h1>
          </div>
          <div style="background:#f9fafb;padding:20px;border-radius:0 0 8px 8px;">
            <p>Hello ${name},</p>
            <p>Your Home Owner request has been approved! You can now post property listings on Delux.</p>
            <p>Start listing your properties and connect with home seekers across Ethiopia.</p>
            <p style="color:#666;font-size:12px;margin-top:20px;">— The Delux Team</p>
          </div>
        </div>`;
    } else if (action === "owner_banned") {
      subject = "Your Home Owner request has been denied";
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#dc2626;color:white;padding:20px;border-radius:8px 8px 0 0;">
            <h1 style="margin:0;">Request Denied</h1>
          </div>
          <div style="background:#f9fafb;padding:20px;border-radius:0 0 8px 8px;">
            <p>Hello ${name},</p>
            <p>Your Home Owner request has been denied.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
            <p>If you believe this is a mistake, please contact our support team.</p>
            <p style="color:#666;font-size:12px;margin-top:20px;">— The Delux Team</p>
          </div>
        </div>`;
    }

    if (subject && html) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "DELUX <noreply@resend.dev>",
          to: [email],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Email send error:", error);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
