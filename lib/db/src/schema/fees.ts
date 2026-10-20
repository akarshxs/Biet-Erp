import { pgTable, text, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const feesTable = pgTable("fees", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  feeType: text("fee_type").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  status: text("status").notNull().default("pending"), // pending | partial | paid
  academicYear: text("academic_year").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFeeSchema = createInsertSchema(feesTable).omit({ createdAt: true });
export type InsertFee = z.infer<typeof insertFeeSchema>;
export type Fee = typeof feesTable.$inferSelect;
