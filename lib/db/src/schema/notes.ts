import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notesTable = pgTable("notes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subjectId: text("subject_id"),
  department: text("department"),
  fileUrl: text("file_url"),
  fileType: text("file_type"),
  uploadedBy: text("uploaded_by").notNull(),
  uploaderName: text("uploader_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notesTable).omit({ createdAt: true });
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notesTable.$inferSelect;
