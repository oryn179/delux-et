import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

interface EmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) throw new Error("RESEND_API_KEY not set");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PropertyInquiryRequest {
  propertyId: string;
  propertyTitle: string;
  ownerName: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      propertyId,
      propertyTitle,
      ownerName,
      senderName,
      senderEmail,
      senderPhone,
      message,
    }: PropertyInquiryRequest = await req.json();

    // Validate required fields
    if (!propertyId || !propertyTitle || !senderName || !senderEmail || !message) {
      throw new Error("Missing required fields");
    }

    // Get property owner's email from the database
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("user_id")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      throw new Error("Property not found");
    }

    // Get owner's email from auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      property.user_id
    );

    if (userError || !userData?.user?.email) {
      throw new Error("Owner email not found");
    }

    const ownerEmail = userData.user.email;

    // Send email to property owner
    await sendEmail({
      from: "DELUX <noreply@resend.dev>",
      to: [ownerEmail],
      subject: `New inquiry about your property: ${propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a, #22c55e); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .message-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #16a34a; }
            .contact-info { background: #ecfdf5; padding: 15px; border-radius: 8px; margin-top: 15px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🏠 New Property Inquiry</h1>
            </div>
            <div class="content">
              <p>Hello ${ownerName},</p>
              <p>You have received a new inquiry about your property listing:</p>
              <p><strong>${propertyTitle}</strong></p>
              
              <div class="message-box">
                <h3 style="margin-top: 0;">Message from ${senderName}:</h3>
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>
              
              <div class="contact-info">
                <h4 style="margin-top: 0;">Contact Information:</h4>
                <p><strong>Name:</strong> ${senderName}</p>
                <p><strong>Email:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
                ${senderPhone ? `<p><strong>Phone:</strong> ${senderPhone}</p>` : ''}
              </div>
              
              <p>Reply directly to this email or use the contact information above to respond to the inquiry.</p>
            </div>
            <div class="footer">
              <p>This email was sent from DELUX - Ethiopia's Free Housing Connection Platform</p>
            </div>
          </div>
        </body>
        </html>
      `,
      replyTo: senderEmail,
    });

    console.log("Property inquiry email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-property-inquiry function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
