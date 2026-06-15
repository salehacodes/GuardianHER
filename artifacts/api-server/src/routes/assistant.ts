import { Router } from "express";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();
const anthropic = new Anthropic();

const AssistantMessageInputSchema = z.object({
  message: z.string().min(1),
  context: z.string().nullish(),
});

router.post("/assistant/chat", async (req, res) => {
  const parsed = AssistantMessageInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { message } = parsed.data;

  try {
    const prompt = `You are GuardianHER's AI Safety Assistant — an empathetic, knowledgeable safety advisor for women. You provide practical, actionable safety guidance.

User question: ${message}

Respond with ONLY valid JSON (no markdown):
{
  "response": "<detailed, empathetic, practical response>",
  "category": "<Safety Tips|Emergency Response|Legal Rights|Digital Safety|Travel Safety|Mental Health>",
  "resources": [
    {"title": "<resource name>", "description": "<brief description>", "url": "<url or null>"},
    {"title": "<resource name>", "description": "<brief description>", "url": "<url or null>"}
  ],
  "timestamp": "${new Date().toISOString()}"
}

Be warm, supportive, and specific. Provide 2-3 actionable resources. Response should be 2-4 sentences.`;

    const aiMessage = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const content = aiMessage.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    res.json(JSON.parse(content.text));
  } catch (err) {
    req.log.error({ err }, "Assistant chat error");
    res.json({
      response: "I'm here to help. For immediate danger, please call emergency services (100/112). Trust your instincts — if something feels wrong, it probably is. Move to a crowded, well-lit area immediately.",
      category: "Emergency Response",
      resources: [
        { title: "National Emergency Helpline", description: "24/7 emergency response", url: null },
        { title: "Women's Helpline", description: "1091 - dedicated women's safety helpline", url: null },
      ],
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
