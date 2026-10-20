import { pgTable, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const resultsTable = pgTable("results", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  subjectId: text("subject_id").notNull(),
  internalMarks: numeric("internal_marks", { precision: 5, scale: 2 }).notNull(),
  externalMarks: numeric("external_marks", { precision: 5, scale: 2 }).notNull(),
  totalMarks: numeric("total_marks", { precision: 5, scale: 2 }).notNull(),
  grade: text("grade").notNull(),
  semester: integer("semester").notNull(),
  academicYear: text("academic_year").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertResultSchema = createInsertSchema(resultsTable).omit({ createdAt: true });
export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof resultsTable.$inferSelect;
