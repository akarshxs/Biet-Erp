import { pgTable, text, integer, date, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const booksTable = pgTable("books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn").notNull(),
  department: text("department").notNull(),
  quantity: integer("quantity").notNull().default(1),
  available: integer("available").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const libraryIssuesTable = pgTable("library_issues", {
  id: text("id").primaryKey(),
  bookId: text("book_id").notNull(),
  studentId: text("student_id").notNull(),
  issueDate: date("issue_date", { mode: "string" }).notNull(),
  returnDate: date("return_date", { mode: "string" }),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  status: text("status").notNull().default("issued"), // issued | returned | overdue
  fine: numeric("fine", { precision: 8, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBookSchema = createInsertSchema(booksTable).omit({ createdAt: true });
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof booksTable.$inferSelect;

export const insertLibraryIssueSchema = createInsertSchema(libraryIssuesTable).omit({ createdAt: true });
export type InsertLibraryIssue = z.infer<typeof insertLibraryIssueSchema>;
export type LibraryIssue = typeof libraryIssuesTable.$inferSelect;
