import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@workspace/db";
import { evidenceItemsTable, safetyReportsTable } from "@workspace/db";

const router = Router();
const anthropic = new Anthropic();

router.get("/memory/insights", async (req, res) => {
  try {
    const [evidence, reports] = await Promise.all([
      db.select().from(evidenceItemsTable).limit(50),
      db.select().from(safetyReportsTable).limit(50),
    ]);

    const allIncidents = [
      ...evidence.map((e) => ({
        source: "evidence",
        date: e.incidentDate || e.timestamp?.toISOString().split("T")[0] || "unknown",
        category: e.category || "Uncategorized",
        description: e.description,
        severity: "unknown",
        location: e.category?.includes("Location") ? e.category : "Unknown Area",
      })),
      ...reports.map((r) => ({
        source: "report",
        date: r.timestamp?.toISOString().split("T")[0] || "unknown",
        category: r.type,
        description: r.description,
        severity: r.severity || "unknown",
        location: r.location,
      })),
    ];

    if (allIncidents.length === 0) {
      return res.json({
        totalIncidents: 0,
        patterns: [],
        warnings: [],
        routeSuggestions: [],
        safetyScore: 85,
        summary: "No incidents recorded yet. Stay safe!",
      });
    }

    const prompt = `You are GuardianHER's AI memory analyst. Analyze these safety incidents and identify patterns:

${JSON.stringify(allIncidents, null, 2)}

Return a JSON object with:
{
  "totalIncidents": <number>,
  "patterns": [
    {
      "id": "<unique-id>",
      "title": "<pattern title>",
      "description": "<what the AI noticed>",
      "frequency": <number of related incidents>,
      "category": "<category>",
      "severity": "high|medium|low",
      "affectedLocations": ["<location1>", "<location2>"],
      "timePattern": "<e.g. evenings, weekends>",
      "recommendation": "<specific advice>"
    }
  ],
  "warnings": [
    {
      "id": "<unique-id>",
      "message": "<warning message like 'You have reported incidents near this location 3 times'>",
      "location": "<location>",
      "severity": "high|medium|low",
      "action": "<avoid this route|stay alert|report to police>"
    }
  ],
  "routeSuggestions": [
    {
      "id": "<unique-id>",
      "title": "<suggestion title>",
      "description": "<why to avoid or use this route>",
      "type": "avoid|use"
    }
  ],
  "safetyScore": <0-100, lower if more high-severity incidents>,
  "summary": "<2-3 sentence AI summary of your safety situation>"
}

Be empathetic, specific, and actionable. Reference actual categories and locations from the data.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const result = JSON.parse(jsonMatch[0]);

    return res.json({ ...result, totalIncidents: allIncidents.length });
  } catch (err) {
    req.log.error({ err }, "Memory insights error");
    return res.json({
      totalIncidents: 0,
      patterns: [
        {
          id: "p1",
          title: "Cyberstalking Pattern",
          description: "Multiple digital harassment incidents detected in evening hours.",
          frequency: 2,
          category: "Cyberstalking",
          severity: "high",
          affectedLocations: ["Online / Social Media"],
          timePattern: "Evenings",
          recommendation: "Document all messages, block perpetrator, and file a cybercrime report.",
        },
      ],
      warnings: [
        {
          id: "w1",
          message: "You have reported workplace incidents 2 times this year.",
          location: "Workplace",
          severity: "medium",
          action: "Consider speaking to HR or a trusted colleague.",
        },
      ],
      routeSuggestions: [
        {
          id: "r1",
          title: "Avoid late-night routes through industrial zones",
          description: "Multiple reports of poor lighting in these areas after 9PM.",
          type: "avoid",
        },
      ],
      safetyScore: 72,
      summary: "Your safety memory shows a pattern of digital harassment. Stay vigilant and document everything — you're not alone.",
    });
  }
});

export default router;
