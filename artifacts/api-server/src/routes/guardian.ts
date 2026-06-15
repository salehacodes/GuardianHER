import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { guardianSessionsTable, safetyAlertsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

const GuardianStartInputSchema = z.object({
  destination: z.string().min(1),
  expectedArrivalTime: z.string().min(1),
  currentLocation: z.string().nullish(),
});

const GuardianCheckinInputSchema = z.object({
  sessionId: z.string().min(1),
  status: z.enum(["safe", "need_help"]),
  location: z.string().nullish(),
});

router.post("/guardian/start", async (req, res) => {
  const parsed = GuardianStartInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { destination, expectedArrivalTime, currentLocation } = parsed.data;

  try {
    const sessionId = randomUUID();
    const [session] = await db.insert(guardianSessionsTable).values({
      sessionId,
      destination,
      expectedArrivalTime,
      currentLocation: currentLocation ?? null,
      status: "active",
    }).returning();

    res.json({
      sessionId: session.sessionId,
      destination: session.destination,
      expectedArrivalTime: session.expectedArrivalTime,
      status: session.status,
      startedAt: session.startedAt?.toISOString() ?? new Date().toISOString(),
      message: `Guardian Mode activated. Your journey to ${destination} is being monitored. Your safety circle will be notified if you don't check in.`,
    });
  } catch (err) {
    req.log.error({ err }, "Start guardian mode error");
    res.status(500).json({ error: "Failed to start guardian mode" });
  }
});

router.post("/guardian/checkin", async (req, res) => {
  const parsed = GuardianCheckinInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { sessionId, status, location } = parsed.data;

  try {
    if (status === "need_help") {
      await db.update(guardianSessionsTable)
        .set({ status: "alert" })
        .where(eq(guardianSessionsTable.sessionId, sessionId));

      await db.insert(safetyAlertsTable).values({
        type: "guardian_alert",
        message: `Guardian Mode alert: user needs help${location ? ` at ${location}` : ""}`,
        location: location ?? "Unknown location",
        severity: "high",
      });

      res.json({
        acknowledged: true,
        message: "Alert sent to your safety circle. Help is being coordinated.",
        nextCheckinIn: 0,
      });
    } else {
      res.json({
        acknowledged: true,
        message: "Check-in received. Stay safe! Next check-in in 15 minutes.",
        nextCheckinIn: 15,
      });
    }
  } catch (err) {
    req.log.error({ err }, "Guardian checkin error");
    res.status(500).json({ error: "Failed to process check-in" });
  }
});

export default router;
