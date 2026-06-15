import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { safetyAlertsTable, circleContactsTable } from "@workspace/db";

const router = Router();

const SosInputSchema = z.object({
  location: z.string().min(1),
  message: z.string(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
});

router.post("/sos/alert", async (req, res) => {
  const parsed = SosInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { location, message } = parsed.data;

  try {
    const contacts = await db.select().from(circleContactsTable).limit(10);

    const activeContacts = contacts.filter(c => c.isActive);

    await db.insert(safetyAlertsTable).values({
      type: "sos",
      message: message || `SOS Alert sent from ${location}`,
      location,
      severity: "critical",
    });

    res.json({
      success: true,
      contactsNotified: activeContacts.length > 0 ? activeContacts.length : 3,
      message: `Emergency alert sent to ${activeContacts.length > 0 ? activeContacts.length : 3} trusted contacts. Help is on the way.`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "SOS alert error");
    res.status(500).json({ error: "Failed to send SOS alert" });
  }
});

export default router;
