import { Router, type IRouter } from "express";
import { AuditLogModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId, today } from "../lib/helpers.js";

const router: IRouter = Router();

router.get("/logs", authMiddleware(["owner", "administrator"]), async (req, res): Promise<void> => {
  const { limit, userId } = req.query as Record<string, string>;
  const lim = limit ? Number(limit) : 100;
  const filter: Record<string, unknown> = {};
  if (userId) filter["userId"] = userId;
  const rows = await AuditLogModel.find(filter).sort({ createdAt: -1 }).limit(lim).lean();
  res.json((rows as any[]).map(l => ({ ...l, id: l._id })));
});

export async function addLog(userId: string, userName: string, action: string, details: string, ip?: string) {
  await AuditLogModel.create({ _id: genId(), userId, userName, action, details, ip: ip ?? null, createdAt: today() });
}

export default router;
