import { Router, type IRouter } from "express";
import { TimetableModel, SubjectModel, UserModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId } from "../lib/helpers.js";

const router: IRouter = Router();

router.get("/timetable", authMiddleware(), async (req, res): Promise<void> => {
  const { department, semester } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (department) filter["department"] = department;
  if (semester) filter["semester"] = Number(semester);
  const rows = await TimetableModel.find(filter).sort({ day: 1, period: 1 }).lean();
  const enriched = await Promise.all((rows as any[]).map(async (t) => {
    const subject = await SubjectModel.findById(t.subjectId).lean() as any;
    const teacher = await UserModel.findById(t.teacherId).lean() as any;
    return { ...t, id: t._id, subjectName: subject?.name ?? null, subjectCode: subject?.code ?? null, teacherName: teacher?.name ?? null };
  }));
  res.json(enriched);
});

router.post("/timetable", authMiddleware(["owner", "admin"]), async (req, res): Promise<void> => {
  const { department, semester, day, period, subjectId, teacherId, room } = req.body;
  const existing = await TimetableModel.findOne({ department, semester: Number(semester), day, period }).lean();
  if (existing) {
    const updated = await TimetableModel.findByIdAndUpdate((existing as any)._id, { subjectId, teacherId, room }, { new: true }).lean() as any;
    const subject = await SubjectModel.findById(updated.subjectId).lean() as any;
    const teacher = await UserModel.findById(updated.teacherId).lean() as any;
    res.json({ ...updated, id: updated._id, subjectName: subject?.name ?? null, teacherName: teacher?.name ?? null });
    return;
  }
  const t = await TimetableModel.create({ _id: genId(), department, semester: Number(semester), day, period, subjectId, teacherId, room });
  const subject = await SubjectModel.findById(subjectId).lean() as any;
  const teacher = await UserModel.findById(teacherId).lean() as any;
  res.status(201).json({ ...t.toJSON(), subjectName: subject?.name ?? null, teacherName: teacher?.name ?? null });
});

export default router;
