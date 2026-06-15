import { Router } from "express";
import { db } from "@workspace/db";
import {
  circleContactsTable,
  evidenceItemsTable,
  safetyReportsTable,
  guardianSessionsTable,
  safetyAlertsTable,
} from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const [circleCount] = await db.select({ count: count() }).from(circleContactsTable);
    const [evidenceCount] = await db.select({ count: count() }).from(evidenceItemsTable);
    const [reportCount] = await db.select({ count: count() }).from(safetyReportsTable);
    const [guardianCount] = await db.select({ count: count() }).from(guardianSessionsTable).where(
      eq(guardianSessionsTable.status, "active")
    );
    const [sosCount] = await db.select({ count: count() }).from(safetyAlertsTable).where(
      eq(safetyAlertsTable.type, "sos")
    );

    const lastSession = await db.select().from(guardianSessionsTable)
      .orderBy(desc(guardianSessionsTable.startedAt)).limit(1);

    res.json({
      safetyScore: 78,
      activeGuardianSessions: guardianCount?.count ?? 0,
      circleContacts: circleCount?.count ?? 0,
      recentReports: reportCount?.count ?? 0,
      evidenceItems: evidenceCount?.count ?? 0,
      sosAlertsSent: sosCount?.count ?? 0,
      lastCheckinTime: lastSession[0]?.startedAt?.toISOString() ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Dashboard summary error");
    res.status(500).json({ error: "Failed to get dashboard summary" });
  }
});

router.get("/dashboard/alerts", async (req, res) => {
  try {
    const alerts = await db.select().from(safetyAlertsTable)
      .orderBy(desc(safetyAlertsTable.timestamp)).limit(20);

    res.json(alerts.map(a => ({
      ...a,
      timestamp: a.timestamp?.toISOString() ?? new Date().toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Recent alerts error");
    res.status(500).json({ error: "Failed to get alerts" });
  }
});

export default router;
