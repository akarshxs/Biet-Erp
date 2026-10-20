import { Router, type IRouter } from "express";
import { MessageModel, NotificationModel, UserModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId, today } from "../lib/helpers.js";

const router: IRouter = Router();

router.get("/messages", authMiddleware(), async (req, res): Promise<void> => {
  const { type } = req.query as Record<string, string>;
  const userId = req.user!.id;
  let filter: Record<string, unknown> = {};
  if (type === "sent") filter = { senderId: userId };
  else if (type === "inbox") filter = { receiverId: userId };
  else filter = { $or: [{ senderId: userId }, { receiverId: userId }] };
  const rows = await MessageModel.find(filter).sort({ createdAt: -1 }).lean();
  const enriched = await Promise.all((rows as any[]).map(async (m) => {
    const receiver = await UserModel.findById(m.receiverId).lean() as any;
    return { ...m, id: m._id, receiverName: receiver?.name ?? null };
  }));
  res.json(enriched);
});

router.post("/messages", authMiddleware(), async (req, res): Promise<void> => {
  const { receiverId, content } = req.body;
  const user = req.user!;
  const m = await MessageModel.create({ _id: genId(), senderId: user.id, senderName: user.name, receiverId, content, read: false, createdAt: today() });
  const receiver = await UserModel.findById(receiverId).lean() as any;
  res.status(201).json({ ...m.toJSON(), receiverName: receiver?.name ?? null });
});

router.post("/messages/:id/read", authMiddleware(), async (req, res): Promise<void> => {
  await MessageModel.findByIdAndUpdate(req.params["id"], { read: true });
  res.json({ message: "Marked as read" });
});

router.get("/notifications", authMiddleware(), async (req, res): Promise<void> => {
  const rows = await NotificationModel.find({ userId: req.user!.id }).sort({ createdAt: -1 }).lean();
  res.json((rows as any[]).map(n => ({ ...n, id: n._id })));
});

router.post("/notifications/:id/read", authMiddleware(), async (req, res): Promise<void> => {
  await NotificationModel.findByIdAndUpdate(req.params["id"], { read: true });
  res.json({ message: "Marked as read" });
});

export default router;
