import { pgTable, text, integer, date, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const assignmentsTable = pgTable("assignments", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  subjectId: text("subject_id"),
  teacherId: text("teacher_id"),
  department: text("department").notNull(),
  semester: integer("semester").notNull(),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  maxMarks: integer("max_marks").notNull().default(100),
  attachments: jsonb("attachments").$type<Array<{ name: string; data: string; type: string }>>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const submissionsTable = pgTable("submissions", {
  id: text("id").primaryKey(),
  assignmentId: text("assignment_id").notNull(),
  studentId: text("student_id").notNull(),
  marks: integer("marks"),
  feedback: text("feedback"),
  status: text("status").notNull().default("submitted"), // submitted | evaluated | returned
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAssignmentSchema = createInsertSchema(assignmentsTable).omit({ createdAt: true });
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignmentsTable.$inferSelect;

export const insertSubmissionSchema = createInsertSchema(submissionsTable).omit({ submittedAt: true });
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissionsTable.$inferSelect;
