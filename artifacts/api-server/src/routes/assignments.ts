import { Router, type IRouter } from "express";
import { AssignmentModel, SubmissionModel, SubjectModel, UserModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId, today } from "../lib/helpers.js";

const router: IRouter = Router();

router.get("/assignments", authMiddleware(), async (req, res): Promise<void> => {
  const { department, semester, subjectId, teacherId } = req.query as Record<string, string>;
  const user = req.user!;
  const filter: Record<string, unknown> = {};
  if (department) filter["department"] = department;
  if (semester) filter["semester"] = Number(semester);
  if (subjectId) filter["subjectId"] = subjectId;
  if (teacherId) filter["teacherId"] = teacherId;
  else if (user.role === "teacher") filter["teacherId"] = user.id;
  const rows = await AssignmentModel.find(filter).sort({ createdAt: -1 }).lean();
  const enriched = await Promise.all((rows as any[]).map(async (a) => {
    const subject = await SubjectModel.findById(a.subjectId).lean() as any;
    const teacher = await UserModel.findById(a.teacherId).lean() as any;
    const submissions = await SubmissionModel.find({ assignmentId: String(a._id) }).lean();
    const userSub = user.role === "student" ? (submissions as any[]).find(s => s.studentId === user.id) : null;
    return { ...a, id: a._id, subjectName: subject?.name ?? null, teacherName: teacher?.name ?? null, submissionCount: submissions.length, userSubmission: userSub ? { ...userSub, id: userSub._id } : null };
  }));
  res.json(enriched);
});

router.post("/assignments", authMiddleware(["owner", "admin", "teacher"]), async (req, res): Promise<void> => {
  const { title, description, subjectId, department, semester, dueDate, maxMarks } = req.body;
  const a = await AssignmentModel.create({
    _id: genId(), title, description, subjectId, teacherId: req.user!.id,
    department, semester: Number(semester), dueDate, maxMarks: Number(maxMarks), attachments: [], createdAt: today(),
  });
  res.status(201).json({ ...a.toJSON() });
});

router.put("/assignments/:id", authMiddleware(["owner", "admin", "teacher"]), async (req, res): Promise<void> => {
  const { title, description, dueDate, maxMarks } = req.body;
  const a = await AssignmentModel.findByIdAndUpdate(req.params["id"], { title, description, dueDate, maxMarks: maxMarks ? Number(maxMarks) : undefined }, { new: true }).lean();
  if (!a) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...(a as any), id: (a as any)._id });
});

router.delete("/assignments/:id", authMiddleware(["owner", "admin", "teacher"]), async (req, res): Promise<void> => {
  await AssignmentModel.findByIdAndDelete(req.params["id"]);
  res.json({ message: "Deleted" });
});

router.get("/submissions", authMiddleware(), async (req, res): Promise<void> => {
  const { assignmentId, studentId } = req.query as Record<string, string>;
  const user = req.user!;
  const filter: Record<string, unknown> = {};
  if (assignmentId) filter["assignmentId"] = assignmentId;
  if (studentId) filter["studentId"] = studentId;
  else if (user.role === "student") filter["studentId"] = user.id;
  const rows = await SubmissionModel.find(filter).lean();
  res.json((rows as any[]).map(s => ({ ...s, id: s._id })));
});

router.post("/submissions", authMiddleware(["student"]), async (req, res): Promise<void> => {
  const { assignmentId, content, fileUrl } = req.body;
  const existing = await SubmissionModel.findOne({ assignmentId, studentId: req.user!.id }).lean();
  if (existing) {
    const updated = await SubmissionModel.findByIdAndUpdate((existing as any)._id, { content, fileUrl, submittedAt: today(), status: "submitted" }, { new: true }).lean();
    res.json({ ...(updated as any), id: (updated as any)._id });
    return;
  }
  const sub = await SubmissionModel.create({ _id: genId(), assignmentId, studentId: req.user!.id, content, fileUrl, submittedAt: today(), status: "submitted" });
  res.status(201).json(sub.toJSON());
});

export default router;
