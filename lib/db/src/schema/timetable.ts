import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export interface TimetablePeriod {
  time: string;
  subjectId?: string | null;
  subjectName?: string | null;
  teacherId?: string | null;
  teacherName?: string | null;
  room: string;
}

export const timetableTable = pgTable("timetable", {
  id: text("id").primaryKey(),
  department: text("department").notNull(),
  semester: integer("semester").notNull(),
  day: text("day").notNull(), // Monday | Tuesday | ...
  periods: jsonb("periods").$type<TimetablePeriod[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTimetableSchema = createInsertSchema(timetableTable).omit({ createdAt: true, updatedAt: true });
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Timetable = typeof timetableTable.$inferSelect;
