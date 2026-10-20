import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const noticesTable = pgTable("notices", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  department: text("department"),
  target: text("target").notNull().default("all"), // all | department | semester | role
  targetValue: text("target_value"),
  priority: text("priority").notNull().default("medium"), // low | medium | high
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNoticeSchema = createInsertSchema(noticesTable).omit({ createdAt: true });
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type Notice = typeof noticesTable.$inferSelect;
