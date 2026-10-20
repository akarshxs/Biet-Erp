import { Router, type IRouter } from "express";
import { FeeModel, UserModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId, today } from "../lib/helpers.js";

const router: IRouter = Router();

router.get("/fees", authMiddleware(), async (req, res): Promise<void> => {
  const { studentId, status, academicYear } = req.query as Record<string, string>;
  const user = req.user!;
  const filter: Record<string, unknown> = {};
  if (studentId) filter["studentId"] = studentId;
  else if (user.role === "student") filter["studentId"] = user.id;
  if (status) filter["status"] = status;
  if (academicYear) filter["academicYear"] = academicYear;
  const rows = await FeeModel.find(filter).sort({ dueDate: 1 }).lean();
  const enriched = await Promise.all((rows as any[]).map(async (f) => {
    const student = await UserModel.findById(f.studentId).lean() as any;
    return { ...f, id: f._id, amount: Number(f.amount), paidAmount: Number(f.paidAmount), studentName: student?.name ?? null };
  }));
  res.json(enriched);
});

router.post("/fees", authMiddleware(["owner", "admin", "administrator"]), async (req, res): Promise<void> => {
  const { studentId, feeType, amount, paidAmount, dueDate, academicYear } = req.body;
  const paid = parseFloat(paidAmount ?? "0");
  const total = parseFloat(amount);
  const status = paid >= total ? "paid" : paid > 0 ? "partial" : "pending";
  const f = await FeeModel.create({
    _id: genId(), studentId, feeType, amount: String(total), paidAmount: String(paid),
    dueDate, status, academicYear: academicYear ?? new Date().getFullYear().toString(), createdAt: today(),
  });
  const student = await UserModel.findById(studentId).lean() as any;
  res.status(201).json({ ...f.toJSON(), amount: total, paidAmount: paid, studentName: student?.name ?? null });
});

router.post("/fees/pay", authMiddleware(["owner", "admin", "administrator"]), async (req, res): Promise<void> => {
  const { feeId, amount } = req.body;
  const fee = await FeeModel.findById(feeId).lean() as any;
  if (!fee) { res.status(404).json({ error: "Fee not found" }); return; }
  const newPaid = Math.min(Number(fee.paidAmount) + parseFloat(amount), Number(fee.amount));
  const status = newPaid >= Number(fee.amount) ? "paid" : "partial";
  const updated = await FeeModel.findByIdAndUpdate(feeId, { paidAmount: String(newPaid), status }, { new: true }).lean() as any;
  res.json({ ...updated, id: updated._id, amount: Number(updated.amount), paidAmount: Number(updated.paidAmount) });
});

export default router;
