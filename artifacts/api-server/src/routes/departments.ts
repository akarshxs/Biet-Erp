import { Router, type IRouter } from "express";
import { DepartmentModel, UserModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId, today } from "../lib/helpers.js";

const router: IRouter = Router();

router.get("/departments", authMiddleware(), async (req, res): Promise<void> => {
  const depts = await DepartmentModel.find().sort({ code: 1 }).lean();
  const enriched = await Promise.all(depts.map(async (d: any) => {
    const count = await UserModel.countDocuments({ department: d.code, role: "student" });
    return { ...d, id: d._id, studentCount: count };
  }));
  res.json(enriched);
});

router.post("/departments", authMiddleware(["owner", "admin", "administrator"]), async (req, res): Promise<void> => {
  const { name, code, hod } = req.body;
  const dept = await DepartmentModel.create({ _id: genId(), name, code, hod: hod || null, createdAt: today() });
  res.status(201).json({ ...dept.toJSON(), studentCount: 0 });
});

router.put("/departments/:id", authMiddleware(["owner", "admin", "administrator"]), async (req, res): Promise<void> => {
  const { name, code, hod } = req.body;
  const dept = await DepartmentModel.findByIdAndUpdate(req.params["id"], { name, code, hod }, { new: true }).lean();
  if (!dept) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...(dept as any), id: (dept as any)._id });
});

router.delete("/departments/:id", authMiddleware(["owner", "admin", "administrator"]), async (req, res): Promise<void> => {
  await DepartmentModel.findByIdAndDelete(req.params["id"]);
  res.json({ message: "Deleted" });
});

export default router;
