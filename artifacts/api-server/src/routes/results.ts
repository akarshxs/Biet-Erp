import { Router, type IRouter } from "express";
import { ResultModel, SubjectModel, UserModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId, today, calculateGrade, calculateSGPA } from "../lib/helpers.js";

const router: IRouter = Router();

router.get("/results", authMiddleware(), async (req, res): Promise<void> => {
  const { studentId, semester, academicYear } = req.query as Record<string, string>;
  const user = req.user!;
  const filter: Record<string, unknown> = {};
  if (studentId) filter["studentId"] = studentId;
  else if (user.role === "student") filter["studentId"] = user.id;
  if (semester) filter["semester"] = Number(semester);
  if (academicYear) filter["academicYear"] = academicYear;
  const rows = await ResultModel.find(filter).sort({ semester: 1 }).lean();
  const enriched = await Promise.all((rows as any[]).map(async (r) => {
    const subject = await SubjectModel.findById(r.subjectId).lean() as any;
    const student = await UserModel.findById(r.studentId).lean() as any;
    return { ...r, id: r._id, subjectName: subject?.name ?? null, subjectCode: subject?.code ?? null, studentName: student?.name ?? null };
  }));
  res.json(enriched);
});

router.post("/results", authMiddleware(["owner", "admin", "teacher"]), async (req, res): Promise<void> => {
  const { studentId, subjectId, semester, academicYear, internalMarks, externalMarks } = req.body;
  const internal = Number(internalMarks);
  const external = Number(externalMarks);
  const total = internal + external;
  const grade = calculateGrade(total);
  const sgpa = calculateSGPA([{ grade, credits: 1 }]);
  const r = await ResultModel.create({
    _id: genId(), studentId, subjectId, semester: Number(semester),
    academicYear: academicYear ?? new Date().getFullYear().toString(),
    internalMarks: internal, externalMarks: external, totalMarks: total,
    grade, sgpa: String(sgpa), createdAt: today(),
  });
  res.status(201).json(r.toJSON());
});

router.put("/results/:id", authMiddleware(["owner", "admin", "teacher"]), async (req, res): Promise<void> => {
  const { internalMarks, externalMarks } = req.body;
  const internal = Number(internalMarks);
  const external = Number(externalMarks);
  const total = internal + external;
  const grade = calculateGrade(total);
  const sgpa = calculateSGPA([{ grade, credits: 1 }]);
  const r = await ResultModel.findByIdAndUpdate(req.params["id"], { internalMarks: internal, externalMarks: external, totalMarks: total, grade, sgpa: String(sgpa) }, { new: true }).lean();
  if (!r) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...(r as any), id: (r as any)._id });
});

router.delete("/results/:id", authMiddleware(["owner", "admin"]), async (req, res): Promise<void> => {
  await ResultModel.findByIdAndDelete(req.params["id"]);
  res.json({ message: "Deleted" });
});

router.get("/results/sgpa/:studentId", authMiddleware(), async (req, res): Promise<void> => {
  const studentId = req.params["studentId"];
  const user = req.user!;
  if (user.role === "student" && user.id !== studentId) { res.status(403).json({ error: "Forbidden" }); return; }
  const results = await ResultModel.find({ studentId }).lean();
  if (!results.length) { res.json({ sgpa: 0, cgpa: 0, semesterWise: [] }); return; }
  const semMap: Record<number, number[]> = {};
  for (const r of results as any[]) {
    if (!semMap[r.semester]) semMap[r.semester] = [];
    semMap[r.semester].push(Number(r.sgpa));
  }
  const semesterWise = Object.entries(semMap).map(([sem, sgpas]) => ({
    semester: Number(sem),
    sgpa: parseFloat((sgpas.reduce((a, b) => a + b, 0) / sgpas.length).toFixed(2)),
  }));
  const cgpa = parseFloat((semesterWise.reduce((a, s) => a + s.sgpa, 0) / semesterWise.length).toFixed(2));
  res.json({ sgpa: semesterWise[semesterWise.length - 1]?.sgpa ?? 0, cgpa, semesterWise });
});

export default router;
