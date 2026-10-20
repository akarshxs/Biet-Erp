import { pgTable, text, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventsTable = pgTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("other"), // workshop | hackathon | technical | cultural | other
  date: date("date", { mode: "string" }).notNull(),
  venue: text("venue").notNull(),
  organizer: text("organizer").notNull(),
  maxParticipants: integer("max_participants").notNull().default(100),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const eventRegistrationsTable = pgTable("event_registrations", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull(),
  userId: text("user_id").notNull(),
  registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ createdAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
