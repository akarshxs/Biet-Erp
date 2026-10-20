import { Router, type IRouter } from "express";
import { PlacementModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId, today } from "../lib/helpers.js";

const router: IRouter = Router();

router.get("/placements", authMiddleware(), async (req, res): Promise<void> => {
  const user = req.user!;
  const { status } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (status) filter["status"] = status;
  const rows = await PlacementModel.find(filter).sort({ deadline: 1 }).lean();
  const enriched = (rows as any[]).map(p => ({
    ...p, id: p._id,
    registrations: p.registrations ?? [],
    registrationCount: (p.registrations ?? []).length,
    isRegistered: (p.registrations ?? []).includes(user.id),
  }));
  res.json(enriched);
});

router.post("/placements", authMiddleware(["owner", "admin"]), async (req, res): Promise<void> => {
  const { companyName, title, description, eligibility, salary, deadline, status } = req.body;
  const p = await PlacementModel.create({
    _id: genId(), companyName, title, description, eligibility, salary, deadline,
    status: status ?? "open", registrations: [], createdAt: today(),
  });
  res.status(201).json({ ...p.toJSON(), registrationCount: 0, isRegistered: false });
});

router.put("/placements/:id", authMiddleware(["owner", "admin"]), async (req, res): Promise<void> => {
  const { companyName, title, description, eligibility, salary, deadline, status } = req.body;
  const p = await PlacementModel.findByIdAndUpdate(req.params["id"], { companyName, title, description, eligibility, salary, deadline, status }, { new: true }).lean();
  if (!p) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...(p as any), id: (p as any)._id });
});

router.post("/placements/:id/register", authMiddleware(), async (req, res): Promise<void> => {
  const placementId = req.params["id"];
  const userId = req.user!.id;
  const placement = await PlacementModel.findById(placementId).lean() as any;
  if (!placement) { res.status(404).json({ error: "Not found" }); return; }
  if ((placement.registrations ?? []).includes(userId)) { res.status(400).json({ error: "Already registered" }); return; }
  const updated = await PlacementModel.findByIdAndUpdate(placementId, { $push: { registrations: userId } }, { new: true }).lean() as any;
  res.json({ ...updated, id: updated._id, registrationCount: (updated.registrations ?? []).length, isRegistered: true });
});

export default router;
