import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const departmentsTable = pgTable("departments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  head: text("head"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDepartmentSchema = createInsertSchema(departmentsTable).omit({ createdAt: true });
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departmentsTable.$inferSelect;
