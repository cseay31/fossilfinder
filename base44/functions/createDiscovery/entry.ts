import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { checkContentEligibility } from '../../shared/userEligibility.ts';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Server-side COPPA and ban enforcement.
  const eligibility = await checkContentEligibility(base44);
  if (!eligibility.allowed) {
    return Response.json({ error: eligibility.error }, { status: eligibility.status });
  }
  const { user } = eligibility;

  const { photo_urls, location, latitude, longitude, additional_notes } = await req.json();

  if (!photo_urls?.length) {
    return Response.json({ error: 'At least one photo is required' }, { status: 400 });
  }

  const ownerName = user.full_name || 'Explorer';
  const photo_url = photo_urls[0];

  // Create discovery with analyzing status.
  const discovery = await base44.entities.Discovery.create({
    photo_url,
    location: location || 'Unknown location',
    latitude,
    longitude,
    analysis_status: 'analyzing',
    visibility: 'public',
    owner_name: ownerName,
    likes: 0,
    liked_by: [],
    comment_count: 0
  });

  // Analyze the fossil with AI (server-side, cannot be bypassed).
  const analysisPrompt = `
      You are an expert archaeologist and paleontologist. Analyze this photo of a potential fossil, artifact, or archaeological finding.

      Additional context from user:
      - Location: ${location || "Not provided"}
      - Notes: ${additional_notes || "None"}

      Provide detailed analysis including:
      1. Classification: What type of fossil, artifact, or archaeological item this appears to be
      2. Confidence level (0-100): How certain you are of this identification
      3. Time period: Geological era or archaeological period
      4. Description: Detailed scientific description of what you observe
      5. Significance: Scientific importance of this finding (low/medium/high/exceptional)
      6. Recommendations: What should be done next with this discovery
      7. Worth Admin Review: true if exceptional, rare, or scientifically important; false for routine findings
      8. Category: One of: fossil, artifact, mineral, rock, plant_fossil, marine_fossil, vertebrate, invertebrate, trace_fossil, unknown
      9. Tags: 3-7 descriptive tags (e.g. ["Jurassic", "marine", "cephalopod", "well-preserved"])
      10. AI Summary: A single clear sentence summarizing the discovery for non-experts
      11. Common Name: The popular/common name if known (e.g. "Ammonite", "Arrowhead")
      12. Key Features: 3-5 specific visual features that identify this specimen
      13. Related Species: 2-4 related species or similar artifact types the user might research
      14. Research Suggestions: 2-3 suggested research topics or resource types as a JSON array of objects with "title" and "description" fields

      Be thorough and scientific. If uncertain, explain why and suggest alternative possibilities.
      `;

  const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: analysisPrompt,
    file_urls: photo_urls,
    response_json_schema: {
      type: "object",
      properties: {
        classification: { type: "string" },
        confidence_score: { type: "number", minimum: 0, maximum: 100 },
        time_period: { type: "string" },
        description: { type: "string" },
        significance_level: { type: "string", enum: ["low", "medium", "high", "exceptional"] },
        recommendations: { type: "string" },
        needs_admin_review: { type: "boolean" },
        category: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        ai_summary: { type: "string" },
        common_name: { type: "string" },
        key_features: { type: "array", items: { type: "string" } },
        related_species: { type: "array", items: { type: "string" } },
        research_suggestions: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } } } }
      }
    }
  });

  // Update discovery with analysis results.
  const updatedDiscovery = await base44.asServiceRole.entities.Discovery.update(discovery.id, {
    ...aiResponse,
    research_suggestions: aiResponse.research_suggestions ? JSON.stringify(aiResponse.research_suggestions) : null,
    analysis_status: 'completed',
    location: discovery.location,
    latitude: discovery.latitude,
    longitude: discovery.longitude
  });

  return Response.json({ success: true, discovery: updatedDiscovery });
});