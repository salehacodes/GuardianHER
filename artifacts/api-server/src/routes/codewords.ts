import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { codeWordsTable, safetyAlertsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const CodeWordInputSchema = z.object({
  phrase: z.string().min(1),
  action: z.enum(["silent_sos", "share_location", "notify_circle"]),
  note: z.string().nullish(),
});

const CodeWordCheckInputSchema = z.object({
  message: z.string().min(1),
});

router.get("/codewords", async (req, res) => {
  try {
    const words = await db.select().from(codeWordsTable).orderBy(codeWordsTable.createdAt);
    res.json(words.map(w => ({
      ...w,
      createdAt: w.createdAt?.toISOString() ?? new Date().toISOString(),
      note: w.note ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Get code words error");
    res.status(500).json({ error: "Failed to get code words" });
  }
});

router.post("/codewords", async (req, res) => {
  const parsed = CodeWordInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const [word] = await db.insert(codeWordsTable).values({
      phrase: parsed.data.phrase,
      action: parsed.data.action,
      note: parsed.data.note ?? null,
    }).returning();

    res.status(201).json({
      ...word,
      createdAt: word.createdAt?.toISOString() ?? new Date().toISOString(),
      note: word.note ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Add code word error");
    res.status(500).json({ error: "Failed to add code word" });
  }
});

router.delete("/codewords/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    await db.delete(codeWordsTable).where(eq(codeWordsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Delete code word error");
    res.status(500).json({ error: "Failed to delete code word" });
  }
});

router.post("/codewords/check", async (req, res) => {
  const parsed = CodeWordCheckInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { message } = parsed.data;

  try {
    const words = await db.select().from(codeWordsTable);
    const messageLower = message.toLowerCase().trim();

    const triggered = words.find(w =>
      messageLower.includes(w.phrase.toLowerCase().trim())
    );

    if (triggered) {
      await db.insert(safetyAlertsTable).values({
        type: "sos",
        message: `Silent SOS triggered via code phrase: "${triggered.phrase}". Action: ${triggered.action}`,
        location: "Unknown — via Assistant",
        severity: "critical",
      });

      const actionMessages: Record<string, string> = {
        silent_sos: "Silent SOS activated. Your safety circle has been alerted and your location shared.",
        share_location: "Location shared silently with your safety circle.",
        notify_circle: "Your safety circle has been notified. They will check on you.",
      };

      res.json({
        triggered: true,
        action: triggered.action,
        phrase: triggered.phrase,
        message: actionMessages[triggered.action] ?? "Code word recognized. Help is being coordinated.",
      });
    } else {
      res.json({
        triggered: false,
        action: null,
        phrase: null,
        message: "No code word detected.",
      });
    }
  } catch (err) {
    req.log.error({ err }, "Check code word error");
    res.status(500).json({ error: "Failed to check code word" });
  }
});

export default router;
