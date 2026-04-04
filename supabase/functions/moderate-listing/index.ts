import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, price, propertyType, listingType, area, amenities } = await req.json();

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ approved: true, reason: "Moderation skipped" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const listingText = `Title: ${title || "N/A"}\nDescription: ${description || "N/A"}\nPrice: ${price} ETB\nType: ${propertyType}\nListing: ${listingType}\nArea: ${area}\nAmenities: ${(amenities || []).join(", ") || "None"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are an AI moderator for a real estate platform in Ethiopia. You review property listings for quality and authenticity. Check for:
1. Is the title/description relevant to real estate? (not spam, ads, or unrelated content)
2. Is the price realistic for Ethiopian property market? (not 0, not absurdly low/high)
3. Does the description seem genuine and not contain offensive/inappropriate content?
4. Is the listing consistent (e.g., a villa shouldn't cost 500 ETB/month)?

Respond with ONLY a JSON object: {"approved": true/false, "reason": "brief explanation", "warnings": ["optional array of minor concerns"]}`,
          },
          {
            role: "user",
            content: `Review this property listing:\n${listingText}`,
          },
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ approved: true, reason: "Moderation service unavailable" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    try {
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch {}

    return new Response(JSON.stringify({ approved: true, reason: "Auto-approved" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Moderation error:", error);
    return new Response(JSON.stringify({ approved: true, reason: "Moderation error, auto-approved" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
