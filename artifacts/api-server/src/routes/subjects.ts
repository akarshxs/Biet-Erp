import { Router, type IRouter } from "express";
import { SubjectModel, UserModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId } from "../lib/helpers.js";

const router: IRouter = Router();

async function enrichSubject(s: any) {
  if (s.teacherId) {
    const teacher = await UserModel.findById(s.teacherId).lean() as any;
    return { ...s, id: s._id, teacherName: teacher?.name ?? null };
  }
  return { ...s, id: s._id, teacherName: null };
}

router.get("/subjects", authMiddleware(), async (req, res): Promise<void> => {
  const { department, semester, teacherId } = req.query as Record<string, string>;
  const user = req.user!;
  const filter: Record<string, unknown> = {};
  if (department) filter["department"] = department;
  if (semester) filter["semester"] = Number(semester);
  const effectiveTeacherId = user.role === "teacher" && !teacherId ? user.id : teacherId;
  if (effectiveTeacherId) filter["teacherId"] = effectiveTeacherId;
  const rows = await SubjectModel.find(filter).sort({ department: 1, semester: 1 }).lean();
  res.json(await Promise.all(rows.map(enrichSubject)));
});

router.post("/subjects", authMiddleware(["owner", "admin"]), async (req, res): Promise<void> => {
  const { code, name, department, semester, credits, teacherId } = req.body;
  const s = await SubjectModel.create({
    _id: genId(), code, name, department,
    semester: Number(semester), credits: Number(credits),
    teacherId: teacherId || null,
  });
  res.status(201).json(await enrichSubject(s.toJSON()));
});

router.put("/subjects/:id", authMiddleware(["owner", "admin"]), async (req, res): Promise<void> => {
  const { code, name, department, semester, credits, teacherId } = req.body;
  const s = await SubjectModel.findByIdAndUpdate(
    req.params["id"],
    { code, name, department, semester: semester ? Number(semester) : undefined, credits: credits ? Number(credits) : undefined, teacherId: teacherId || null },
    { new: true }
  ).lean();
  if (!s) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichSubject(s));
});

router.delete("/subjects/:id", authMiddleware(["owner", "admin"]), async (req, res): Promise<void> => {
  await SubjectModel.findByIdAndDelete(req.params["id"]);
  res.json({ message: "Deleted" });
});

export default router;
