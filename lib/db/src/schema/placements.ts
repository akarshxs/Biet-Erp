import { pgTable, text, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const placementsTable = pgTable("placements", {
  id: text("id").primaryKey(),
  companyName: text("company_name").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eligibility: text("eligibility").notNull(),
  salary: text("salary").notNull(),
  deadline: date("deadline", { mode: "string" }).notNull(),
  status: text("status").notNull().default("open"), // open | closed | upcoming
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const placementRegistrationsTable = pgTable("placement_registrations", {
  id: text("id").primaryKey(),
  placementId: text("placement_id").notNull(),
  userId: text("user_id").notNull(),
  registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPlacementSchema = createInsertSchema(placementsTable).omit({ createdAt: true });
export type InsertPlacement = z.infer<typeof insertPlacementSchema>;
export type PlacementRow = typeof placementsTable.$inferSelect;
