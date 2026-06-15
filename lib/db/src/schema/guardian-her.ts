import { pgTable, text, serial, integer, boolean, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const riskLevelEnum = pgEnum("risk_level", ["Low", "Medium", "High"]);
export const evidenceTypeEnum = pgEnum("evidence_type", ["screenshot", "voice", "image", "document"]);
export const reportTypeEnum = pgEnum("report_type", ["harassment", "suspicious_activity", "unsafe_area", "poor_lighting", "other"]);
export const severityEnum = pgEnum("severity", ["low", "medium", "high"]);
export const safeSpaceTypeEnum = pgEnum("safe_space_type", ["police", "hospital", "pharmacy", "womens_center", "shelter"]);
export const guardianStatusEnum = pgEnum("guardian_status", ["active", "completed", "alert"]);
export const alertTypeEnum = pgEnum("alert_type", ["sos", "guardian_alert", "community_report", "predictive"]);
export const alertSeverityEnum = pgEnum("alert_severity", ["low", "medium", "high", "critical"]);

export const circleContactsTable = pgTable("circle_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  phone: text("phone").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastSeen: text("last_seen"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const evidenceItemsTable = pgTable("evidence_items", {
  id: serial("id").primaryKey(),
  type: evidenceTypeEnum("type").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  fileUrl: text("file_url"),
  incidentDate: text("incident_date"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const safetyReportsTable = pgTable("safety_reports", {
  id: serial("id").primaryKey(),
  type: reportTypeEnum("type").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  severity: severityEnum("severity").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const guardianSessionsTable = pgTable("guardian_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  destination: text("destination").notNull(),
  expectedArrivalTime: text("expected_arrival_time").notNull(),
  currentLocation: text("current_location"),
  status: guardianStatusEnum("status").notNull().default("active"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const safetyAlertsTable = pgTable("safety_alerts", {
  id: serial("id").primaryKey(),
  type: alertTypeEnum("type").notNull(),
  message: text("message").notNull(),
  location: text("location").notNull(),
  severity: alertSeverityEnum("severity").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertCircleContactSchema = createInsertSchema(circleContactsTable).omit({ id: true, createdAt: true });
export const insertEvidenceItemSchema = createInsertSchema(evidenceItemsTable).omit({ id: true, timestamp: true });
export const insertSafetyReportSchema = createInsertSchema(safetyReportsTable).omit({ id: true, timestamp: true, upvotes: true });
export const insertGuardianSessionSchema = createInsertSchema(guardianSessionsTable).omit({ id: true, startedAt: true, completedAt: true });
export const insertSafetyAlertSchema = createInsertSchema(safetyAlertsTable).omit({ id: true, timestamp: true });

export type CircleContact = typeof circleContactsTable.$inferSelect;
export type InsertCircleContact = z.infer<typeof insertCircleContactSchema>;
export type EvidenceItem = typeof evidenceItemsTable.$inferSelect;
export type InsertEvidenceItem = z.infer<typeof insertEvidenceItemSchema>;
export type SafetyReport = typeof safetyReportsTable.$inferSelect;
export type InsertSafetyReport = z.infer<typeof insertSafetyReportSchema>;
export type GuardianSession = typeof guardianSessionsTable.$inferSelect;
export type SafetyAlert = typeof safetyAlertsTable.$inferSelect;
