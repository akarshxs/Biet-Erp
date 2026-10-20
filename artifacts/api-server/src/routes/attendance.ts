import { Router, type IRouter } from "express";
import { AttendanceModel, SubjectModel, UserModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId, today } from "../lib/helpers.js";

const router: IRouter = Router();

router.get("/attendance", authMiddleware(), async (req, res): Promise<void> => {
  const { studentId, subjectId, date } = req.query as Record<string, string>;
  const user = req.user!;
  const filter: Record<string, unknown> = {};
  if (studentId) filter["studentId"] = studentId;
  else if (user.role === "student") filter["studentId"] = user.id;
  if (subjectId) filter["subjectId"] = subjectId;
  if (date) filter["date"] = date;
  const rows = await AttendanceModel.find(filter).sort({ date: 1 }).lean();
  const enriched = await Promise.all(rows.map(async (r: any) => {
    const student = await UserModel.findById(r.studentId).lean() as any;
    const subject = await SubjectModel.findById(r.subjectId).lean() as any;
    return { ...r, id: r._id, studentName: student?.name ?? null, subjectName: subject?.name ?? null };
  }));
  res.json(enriched);
});

router.post("/attendance", authMiddleware(["owner", "admin", "teacher"]), async (req, res): Promise<void> => {
  const { subjectId, date, records } = req.body;
  if (!subjectId || !records || !Array.isArray(records)) { res.status(400).json({ error: "subjectId, date, records required" }); return; }
  const dateStr = date || today();
  const markedBy = req.user!.id;
  for (const r of records) {
    const existing = await AttendanceModel.findOne({ studentId: r.studentId, subjectId, date: dateStr }).lean();
    if (existing) {
      await AttendanceModel.findByIdAndUpdate((existing as any)._id, { status: r.status });
    } else {
      await AttendanceModel.create({ _id: genId(), studentId: r.studentId, subjectId, date: dateStr, status: r.status, markedBy });
    }
  }
  res.status(201).json({ message: "Attendance marked" });
});

router.get("/attendance/stats/:studentId", authMiddleware(), async (req, res): Promise<void> => {
  const studentId = req.params["studentId"];
  const user = req.user!;
  if (user.role === "student" && user.id !== studentId) { res.status(403).json({ error: "Forbidden" }); return; }
  const records = await AttendanceModel.find({ studentId }).lean();
  const subjects = await SubjectModel.find().lean();
  const subjectMap = new Map((subjects as any[]).map(s => [String(s._id), s.name]));
  const grouped: Record<string, { subjectId: string; subjectName: string; present: number; total: number }> = {};
  for (const r of records as any[]) {
    if (!grouped[r.subjectId]) grouped[r.subjectId] = { subjectId: r.subjectId, subjectName: subjectMap.get(r.subjectId) ?? r.subjectId, present: 0, total: 0 };
    grouped[r.subjectId].total++;
    if (r.status === "present" || r.status === "late") grouped[r.subjectId].present++;
  }
  const bySubject = Object.values(grouped).map(s => ({ ...s, percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0 }));
  const totalPresent = bySubject.reduce((a, s) => a + s.present, 0);
  const totalClasses = bySubject.reduce((a, s) => a + s.total, 0);
  res.json({ bySubject, overall: { present: totalPresent, total: totalClasses, percentage: totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0 } });
});

export default router;
