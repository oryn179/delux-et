import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AdminMessageRequest {
  recipientId: string;
  subject: string;
  message: string;
  sendEmail: boolean;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the user is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) {
      throw new Error("Admin access required");
    }

    const { recipientId, subject, message, sendEmail }: AdminMessageRequest = await req.json();

    // Get recipient profile
    const { data: recipient } = await supabase
      .from("profiles")
      .select("name, user_id")
      .eq("user_id", recipientId)
      .single();

    if (!recipient) {
      throw new Error("Recipient not found");
    }

    // Get recipient email from auth
    const { data: { user: recipientUser } } = await supabase.auth.admin.getUserById(recipientId);
    const recipientEmail = recipientUser?.email;

    // Create notification in the database
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: recipientId,
        type: "admin_message",
        title: subject,
        message: message,
        link: null,
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    // Send email if requested and recipient has email
    let emailSent = false;
    if (sendEmail && recipientEmail && RESEND_API_KEY) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Delux <noreply@resend.dev>",
            to: [recipientEmail],
            subject: `Delux: ${subject}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Delux</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                  <h2 style="color: #111827;">${subject}</h2>
                  <p style="color: #374151; line-height: 1.6;">Dear ${recipient.name},</p>
                  <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                  </div>
                  <p style="color: #6b7280; font-size: 14px;">
                    This message was sent by the Delux admin team.
                  </p>
                </div>
                <div style="padding: 20px; text-align: center; background: #111827; color: #9ca3af; font-size: 12px;">
                  <p>© ${new Date().getFullYear()} Delux. All rights reserved.</p>
                  <p>Made with ❤️ in Ethiopia</p>
                </div>
              </div>
            `,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
        } else {
          console.error("Resend API error:", await emailRes.text());
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    }

    // Log admin action
    await supabase.from("admin_activity_logs").insert({
      admin_id: user.id,
      action: "send_message_to_user",
      target_type: "user",
      target_id: recipientId,
      details: { subject, emailSent },
    });

    return new Response(
      JSON.stringify({ success: true, emailSent }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-admin-message:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
