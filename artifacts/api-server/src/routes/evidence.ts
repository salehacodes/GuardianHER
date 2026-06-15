import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { evidenceItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const EvidenceInputSchema = z.object({
  type: z.enum(["screenshot", "voice", "image", "document"]),
  description: z.string().min(1),
  category: z.string().min(1),
  fileUrl: z.string().nullish(),
  incidentDate: z.string().nullish(),
});

router.get("/evidence", async (req, res) => {
  try {
    const items = await db.select().from(evidenceItemsTable).orderBy(evidenceItemsTable.timestamp);
    res.json(items.map(item => ({
      ...item,
      timestamp: item.timestamp?.toISOString() ?? new Date().toISOString(),
      fileUrl: item.fileUrl ?? null,
      incidentDate: item.incidentDate ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Get evidence error");
    res.status(500).json({ error: "Failed to get evidence" });
  }
});

router.post("/evidence", async (req, res) => {
  const parsed = EvidenceInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const [item] = await db.insert(evidenceItemsTable).values({
      type: parsed.data.type,
      description: parsed.data.description,
      category: parsed.data.category,
      fileUrl: parsed.data.fileUrl ?? null,
      incidentDate: parsed.data.incidentDate ?? null,
    }).returning();

    res.status(201).json({
      ...item,
      timestamp: item.timestamp?.toISOString() ?? new Date().toISOString(),
      fileUrl: item.fileUrl ?? null,
      incidentDate: item.incidentDate ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Add evidence error");
    res.status(500).json({ error: "Failed to add evidence" });
  }
});

router.delete("/evidence/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    await db.delete(evidenceItemsTable).where(eq(evidenceItemsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Delete evidence error");
    res.status(500).json({ error: "Failed to delete evidence" });
  }
});

export default router;
