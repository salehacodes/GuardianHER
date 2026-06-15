import { Router } from "express";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@workspace/db";
import { evidenceItemsTable } from "@workspace/db";
import { inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();
const anthropic = new Anthropic();

const EvidenceCategorizeInputSchema = z.object({
  description: z.string().min(1),
  type: z.string().min(1),
  incidentDate: z.string().nullish(),
});

const IncidentReportInputSchema = z.object({
  evidenceIds: z.array(z.number()).min(1),
  title: z.string().min(1),
  additionalContext: z.string().nullish(),
});

router.post("/evidence/categorize", async (req, res) => {
  const parsed = EvidenceCategorizeInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { description, type, incidentDate } = parsed.data;

  try {
    const prompt = `You are GuardianHER's Evidence Analysis AI. Analyze this evidence submission and categorize it.

Evidence Type: ${type}
Description: ${description}
Date: ${incidentDate ?? "Not specified"}

Respond with ONLY valid JSON (no markdown):
{
  "category": "<primary category: Cyberstalking|Online Harassment|Physical Harassment|Workplace Harassment|Intimate Partner Violence|Deepfake/Image Abuse|Threatening Messages|Stalking|Sexual Harassment|Other>",
  "incidentType": "<specific incident type>",
  "severity": "<low|medium|high|critical>",
  "summary": "<2-3 sentence AI-generated summary of the incident based on the evidence>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}

Be empathetic and clinical. The summary should be written in third-person for official use.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    res.json(JSON.parse(content.text));
  } catch (err) {
    req.log.error({ err }, "Evidence categorize error");
    res.json({
      category: "Online Harassment",
      incidentType: "Digital Harassment",
      severity: "medium",
      summary: "Evidence submitted documenting an incident of harassment. The evidence has been securely stored and timestamped for official use.",
      tags: ["harassment", "digital", "evidence"],
    });
  }
});

router.post("/evidence/report", async (req, res) => {
  const parsed = IncidentReportInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { evidenceIds, title, additionalContext } = parsed.data;

  try {
    const items = await db.select().from(evidenceItemsTable)
      .where(inArray(evidenceItemsTable.id, evidenceIds));

    if (items.length === 0) {
      res.status(404).json({ error: "No evidence items found" });
      return;
    }

    const evidenceSummary = items.map((item, i) =>
      `${i + 1}. [${item.type.toUpperCase()}] ${item.description} (Category: ${item.category}, Date: ${item.incidentDate ?? item.timestamp?.toLocaleDateString() ?? "Unknown"})`
    ).join("\n");

    const prompt = `You are GuardianHER's Legal Documentation AI. Generate a formal incident report for law enforcement or institutional submission.

Report Title: ${title}
Evidence Items (${items.length} total):
${evidenceSummary}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Respond with ONLY valid JSON (no markdown):
{
  "incidentType": "<primary incident classification>",
  "severity": "<Low|Medium|High|Critical>",
  "summary": "<formal 3-4 sentence executive summary suitable for a police report>",
  "timeline": "<chronological narrative of events based on evidence>",
  "recommendations": [
    "<immediate action 1>",
    "<immediate action 2>",
    "<immediate action 3>"
  ],
  "legalSteps": [
    "<legal step 1>",
    "<legal step 2>",
    "<legal step 3>",
    "<legal step 4>"
  ]
}

Write formally and objectively. The summary should reference the number of evidence items. Legal steps should be India-specific (mention police complaint, cybercrime portal, IT Act sections).`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    const aiResult = JSON.parse(content.text);

    res.json({
      reportId: randomUUID().slice(0, 8).toUpperCase(),
      title,
      generatedAt: new Date().toISOString(),
      evidenceCount: items.length,
      evidenceItems: items.map(item => ({
        ...item,
        timestamp: item.timestamp?.toISOString() ?? new Date().toISOString(),
        fileUrl: item.fileUrl ?? null,
        incidentDate: item.incidentDate ?? null,
      })),
      ...aiResult,
    });
  } catch (err) {
    req.log.error({ err }, "Generate incident report error");
    res.status(500).json({ error: "Failed to generate incident report" });
  }
});

export default router;
