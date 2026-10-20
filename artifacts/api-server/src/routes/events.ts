import { Router, type IRouter } from "express";
import { EventModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId, today } from "../lib/helpers.js";

const router: IRouter = Router();

router.get("/events", authMiddleware(), async (req, res): Promise<void> => {
  const user = req.user!;
  const rows = await EventModel.find().sort({ date: 1 }).lean();
  const enriched = (rows as any[]).map(e => ({
    ...e, id: e._id,
    registrations: e.registrations ?? [],
    registrationCount: (e.registrations ?? []).length,
    isRegistered: (e.registrations ?? []).includes(user.id),
  }));
  res.json(enriched);
});

router.post("/events", authMiddleware(["owner", "admin"]), async (req, res): Promise<void> => {
  const { title, description, type, date, venue, organizer, maxParticipants } = req.body;
  const e = await EventModel.create({
    _id: genId(), title, description, type: type ?? "other",
    date, venue, organizer, maxParticipants: Number(maxParticipants),
    registrations: [], createdAt: today(),
  });
  res.status(201).json({ ...e.toJSON(), registrationCount: 0, isRegistered: false });
});

router.put("/events/:id", authMiddleware(["owner", "admin"]), async (req, res): Promise<void> => {
  const { title, description, type, date, venue, maxParticipants } = req.body;
  const e = await EventModel.findByIdAndUpdate(
    req.params["id"],
    { title, description, type, date, venue, maxParticipants: maxParticipants ? Number(maxParticipants) : undefined },
    { new: true }
  ).lean();
  if (!e) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...(e as any), id: (e as any)._id });
});

router.delete("/events/:id", authMiddleware(["owner", "admin"]), async (req, res): Promise<void> => {
  await EventModel.findByIdAndDelete(req.params["id"]);
  res.json({ message: "Deleted" });
});

router.post("/events/:id/register", authMiddleware(), async (req, res): Promise<void> => {
  const eventId = req.params["id"];
  const userId = req.user!.id;
  const event = await EventModel.findById(eventId).lean() as any;
  if (!event) { res.status(404).json({ error: "Event not found" }); return; }
  const regs = event.registrations ?? [];
  if (regs.includes(userId)) { res.status(400).json({ error: "Already registered" }); return; }
  if (regs.length >= event.maxParticipants) { res.status(400).json({ error: "Event is full" }); return; }
  const updated = await EventModel.findByIdAndUpdate(eventId, { $push: { registrations: userId } }, { new: true }).lean() as any;
  res.json({ ...updated, id: updated._id, registrationCount: (updated.registrations ?? []).length, isRegistered: true });
});

export default router;
