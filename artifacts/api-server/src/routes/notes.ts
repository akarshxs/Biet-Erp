import { Router, type IRouter } from "express";
import { NoteModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId, today } from "../lib/helpers.js";

const router: IRouter = Router();

router.get("/notes", authMiddleware(), async (req, res): Promise<void> => {
  const { subjectId, department } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (subjectId) filter["subjectId"] = subjectId;
  if (department) filter["department"] = department;
  const rows = await NoteModel.find(filter).sort({ createdAt: 1 }).lean();
  res.json((rows as any[]).map(n => ({ ...n, id: n._id })));
});

router.post("/notes", authMiddleware(["owner", "admin", "teacher"]), async (req, res): Promise<void> => {
  const { title, description, subjectId, department, fileUrl, fileType } = req.body;
  const user = req.user!;
  const n = await NoteModel.create({
    _id: genId(), title, description: description || null,
    subjectId: subjectId || null, department: department || null,
    uploadedBy: user.id, uploaderName: user.name,
    fileUrl: fileUrl || null, fileType: fileType || null, createdAt: today(),
  });
  res.status(201).json(n.toJSON());
});

router.delete("/notes/:id", authMiddleware(["owner", "admin", "teacher"]), async (req, res): Promise<void> => {
  await NoteModel.findByIdAndDelete(req.params["id"]);
  res.json({ message: "Deleted" });
});

export default router;
