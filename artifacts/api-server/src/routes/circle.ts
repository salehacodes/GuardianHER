import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { circleContactsTable, insertCircleContactSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const CircleContactInputSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().min(1),
  phone: z.string().min(1),
});

router.get("/circle", async (req, res) => {
  try {
    const contacts = await db.select().from(circleContactsTable).orderBy(circleContactsTable.createdAt);
    res.json(contacts.map(c => ({
      ...c,
      lastSeen: c.lastSeen ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Get circle contacts error");
    res.status(500).json({ error: "Failed to get contacts" });
  }
});

router.post("/circle", async (req, res) => {
  const parsed = CircleContactInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const [contact] = await db.insert(circleContactsTable).values({
      name: parsed.data.name,
      relationship: parsed.data.relationship,
      phone: parsed.data.phone,
      isActive: true,
    }).returning();
    res.status(201).json(contact);
  } catch (err) {
    req.log.error({ err }, "Add circle contact error");
    res.status(500).json({ error: "Failed to add contact" });
  }
});

router.delete("/circle/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    await db.delete(circleContactsTable).where(eq(circleContactsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Remove circle contact error");
    res.status(500).json({ error: "Failed to remove contact" });
  }
});

export default router;
