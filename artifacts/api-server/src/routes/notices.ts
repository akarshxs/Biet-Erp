import { Router, type IRouter } from "express";
import { NoticeModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId, today } from "../lib/helpers.js";

const router: IRouter = Router();

router.get("/notices", authMiddleware(), async (req, res): Promise<void> => {
  const rows = await NoticeModel.find().sort({ createdAt: -1 }).lean();
  res.json((rows as any[]).map(n => ({ ...n, id: n._id })));
});

router.post("/notices", authMiddleware(["owner", "admin", "teacher"]), async (req, res): Promise<void> => {
  const { title, content, department, target, targetValue, priority } = req.body;
  const user = req.user!;
  const n = await NoticeModel.create({
    _id: genId(), title, content, authorId: user.id, authorName: user.name,
    department: department || null, target: target ?? "all",
    targetValue: targetValue || null, priority: priority ?? "medium", isActive: true, createdAt: today(),
  });
  res.status(201).json(n.toJSON());
});

router.put("/notices/:id", authMiddleware(["owner", "admin", "teacher"]), async (req, res): Promise<void> => {
  const { title, content, priority, isActive } = req.body;
  const n = await NoticeModel.findByIdAndUpdate(req.params["id"], { title, content, priority, isActive }, { new: true }).lean();
  if (!n) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...(n as any), id: (n as any)._id });
});

router.delete("/notices/:id", authMiddleware(["owner", "admin"]), async (req, res): Promise<void> => {
  await NoticeModel.findByIdAndDelete(req.params["id"]);
  res.json({ message: "Deleted" });
});

export default router;
