import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subjectsTable = pgTable("subjects", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  semester: integer("semester").notNull(),
  credits: integer("credits").notNull().default(3),
  teacherId: text("teacher_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSubjectSchema = createInsertSchema(subjectsTable).omit({ createdAt: true });
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjectsTable.$inferSelect;
