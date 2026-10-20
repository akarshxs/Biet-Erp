import { Router, type IRouter } from "express";
import { BookModel, BookIssueModel, UserModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId, today } from "../lib/helpers.js";

const router: IRouter = Router();

router.get("/library/books", authMiddleware(), async (req, res): Promise<void> => {
  const { department, search } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (department) filter["department"] = department;
  if (search) filter["$or"] = [
    { title: { $regex: search, $options: "i" } },
    { author: { $regex: search, $options: "i" } },
    { isbn: { $regex: search, $options: "i" } },
  ];
  const rows = await BookModel.find(filter).sort({ title: 1 }).lean();
  res.json((rows as any[]).map(b => ({ ...b, id: b._id })));
});

router.post("/library/books", authMiddleware(["owner", "admin"]), async (req, res): Promise<void> => {
  const { title, author, isbn, department, quantity } = req.body;
  const qty = Number(quantity);
  const b = await BookModel.create({ _id: genId(), title, author, isbn, department, quantity: qty, available: qty, createdAt: today() });
  res.status(201).json(b.toJSON());
});

router.get("/library/issues", authMiddleware(), async (req, res): Promise<void> => {
  const { studentId, status } = req.query as Record<string, string>;
  const user = req.user!;
  const filter: Record<string, unknown> = {};
  if (studentId) filter["studentId"] = studentId;
  else if (user.role === "student") filter["studentId"] = user.id;
  if (status) filter["status"] = status;
  const rows = await BookIssueModel.find(filter).sort({ issueDate: 1 }).lean();
  const enriched = await Promise.all((rows as any[]).map(async (issue) => {
    const book = await BookModel.findById(issue.bookId).lean() as any;
    const student = await UserModel.findById(issue.studentId).lean() as any;
    return { ...issue, id: issue._id, fine: Number(issue.fine), bookTitle: book?.title ?? null, studentName: student?.name ?? null };
  }));
  res.json(enriched);
});

router.post("/library/issues", authMiddleware(["owner", "admin"]), async (req, res): Promise<void> => {
  const { bookId, studentId, dueDate } = req.body;
  const book = await BookModel.findById(bookId).lean() as any;
  if (!book || book.available <= 0) { res.status(400).json({ error: "Book not available" }); return; }
  const issue = await BookIssueModel.create({ _id: genId(), bookId, studentId, issueDate: today(), dueDate, status: "issued", fine: "0", createdAt: today() });
  await BookModel.findByIdAndUpdate(bookId, { available: book.available - 1 });
  const student = await UserModel.findById(studentId).lean() as any;
  res.status(201).json({ ...issue.toJSON(), fine: 0, bookTitle: book.title, studentName: student?.name ?? null });
});

router.post("/library/issues/:id/return", authMiddleware(["owner", "admin"]), async (req, res): Promise<void> => {
  const id = req.params["id"];
  const issue = await BookIssueModel.findById(id).lean() as any;
  if (!issue) { res.status(404).json({ error: "Not found" }); return; }
  const returnDate = today();
  const due = new Date(issue.dueDate);
  const ret = new Date(returnDate);
  const days = Math.max(0, Math.floor((ret.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
  const fine = days * 5;
  const updated = await BookIssueModel.findByIdAndUpdate(id, { returnDate, status: "returned", fine: String(fine) }, { new: true }).lean() as any;
  await BookModel.findByIdAndUpdate(issue.bookId, { $inc: { available: 1 } });
  res.json({ ...updated, id: updated._id, fine });
});

export default router;
