import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { safetyReportsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

const SafetyReportInputSchema = z.object({
  type: z.enum(["harassment", "suspicious_activity", "unsafe_area", "poor_lighting", "other"]),
  description: z.string().min(1),
  location: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
});

router.get("/reports", async (req, res) => {
  try {
    const reports = await db.select().from(safetyReportsTable).orderBy(desc(safetyReportsTable.timestamp)).limit(50);
    res.json(reports.map(r => ({
      ...r,
      timestamp: r.timestamp?.toISOString() ?? new Date().toISOString(),
      latitude: r.latitude ? parseFloat(r.latitude) : null,
      longitude: r.longitude ? parseFloat(r.longitude) : null,
    })));
  } catch (err) {
    req.log.error({ err }, "Get reports error");
    res.status(500).json({ error: "Failed to get reports" });
  }
});

router.post("/reports", async (req, res) => {
  const parsed = SafetyReportInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const [report] = await db.insert(safetyReportsTable).values({
      type: parsed.data.type,
      description: parsed.data.description,
      location: parsed.data.location,
      severity: parsed.data.severity,
      latitude: parsed.data.latitude?.toString() ?? null,
      longitude: parsed.data.longitude?.toString() ?? null,
      upvotes: 0,
    }).returning();

    res.status(201).json({
      ...report,
      timestamp: report.timestamp?.toISOString() ?? new Date().toISOString(),
      latitude: report.latitude ? parseFloat(report.latitude) : null,
      longitude: report.longitude ? parseFloat(report.longitude) : null,
    });
  } catch (err) {
    req.log.error({ err }, "Submit report error");
    res.status(500).json({ error: "Failed to submit report" });
  }
});

export default router;
