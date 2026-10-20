import { pgTable, text, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const attendanceTable = pgTable("attendance", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  subjectId: text("subject_id").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  status: text("status").notNull().default("absent"), // present | absent | late
  markedBy: text("marked_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAttendanceSchema = createInsertSchema(attendanceTable).omit({ createdAt: true });
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendanceTable.$inferSelect;
