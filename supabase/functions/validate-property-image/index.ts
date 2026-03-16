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
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ valid: false, reason: "No image provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      // If no API key, just allow the image
      return new Response(JSON.stringify({ valid: true, reason: "Validation skipped" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
            content: `You are an image validator for a real estate platform. Your job is to determine if an uploaded image is a valid property/house photo. Valid images include: exterior or interior photos of houses, apartments, villas, buildings, rooms, kitchens, bathrooms, gardens, balconies, real estate land. Invalid images include: selfies, memes, screenshots, random objects, animals, text images, logos, inappropriate content, food, etc. Respond with ONLY a JSON object: {"valid": true/false, "reason": "brief explanation"}`,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
              {
                type: "text",
                text: "Is this a valid property/house photo for a real estate listing?",
              },
            ],
          },
        ],
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse the AI response
    try {
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch {
      // If parsing fails, check for keywords
    }

    const isValid = content.toLowerCase().includes('"valid": true') || content.toLowerCase().includes('"valid":true');
    return new Response(
      JSON.stringify({ valid: isValid, reason: isValid ? "Image appears to be a property photo" : "Image does not appear to be a property photo" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ valid: true, reason: "Validation error, allowing image" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
