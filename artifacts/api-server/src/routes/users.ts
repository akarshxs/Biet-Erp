import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";
import { genId, today } from "../lib/helpers.js";

const router: IRouter = Router();

router.get("/users", authMiddleware(), async (req, res): Promise<void> => {
  const { role, department, search } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (role) filter["role"] = role;
  if (department) filter["department"] = department;
  if (search) filter["$or"] = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];
  const users = await UserModel.find(filter).sort({ createdAt: -1 }).lean();
  res.json(users.map((u: any) => { const { passwordHash: _, ...safe } = u; return { ...safe, id: safe._id }; }));
});

router.post("/users", authMiddleware(["owner", "admin", "administrator"]), async (req, res): Promise<void> => {
  const { email, password, name, role, phone, department, semester, year, rollNumber, employeeId, admissionYear, batch, designation, qualification } = req.body;
  if (!email || !password || !name) { res.status(400).json({ error: "Name, email, and predefined password are required" }); return; }
  const normalizedEmail = String(email).trim().toLowerCase();
  const allUsers = await UserModel.find();
  const existing = allUsers.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
  if (existing) { res.status(400).json({ error: "An account with this email already exists" }); return; }
  const hash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    _id: genId(),
    email: normalizedEmail,
    passwordHash: hash,
    name: String(name).trim(),
    role: role ?? "teacher",
    phone: phone ? String(phone).trim() : undefined,
    department: department ? String(department).trim() : undefined,
    semester: semester ? Number(semester) : undefined,
    year: year ? Number(year) : undefined,
    rollNumber: rollNumber ? String(rollNumber).trim() : undefined,
    employeeId: employeeId ? String(employeeId).trim() : undefined,
    admissionYear: admissionYear ? Number(admissionYear) : undefined,
    batch,
    designation: designation ? String(designation).trim() : undefined,
    qualification: qualification ? String(qualification).trim() : undefined,
    isActive: true,
    createdAt: today(),
  });
  const doc = user.toJSON() as any;
  const { passwordHash: _, ...safe } = doc;
  res.status(201).json({ ...safe, id: safe._id });
});

router.get("/users/:id", authMiddleware(), async (req, res): Promise<void> => {
  const user = await UserModel.findById(req.params["id"]).lean();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const { passwordHash: _, ...safe } = user as any;
  res.json({ ...safe, id: safe._id });
});

router.put("/users/:id", authMiddleware(["owner", "admin", "administrator"]), async (req, res): Promise<void> => {
  const { name, role, department, phone, semester, year, rollNumber, employeeId, designation, qualification, isActive, password } = req.body;
  const updateData: Record<string, any> = {
    name, role, department, phone,
    semester: semester ? Number(semester) : undefined,
    year: year ? Number(year) : undefined,
    rollNumber, employeeId, designation, qualification, isActive
  };
  if (password && String(password).trim().length >= 6) {
    updateData["passwordHash"] = await bcrypt.hash(String(password).trim(), 10);
  }
  const user = await UserModel.findByIdAndUpdate(
    req.params["id"],
    updateData,
    { new: true }
  ).lean();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const { passwordHash: _, ...safe } = user as any;
  res.json({ ...safe, id: safe._id });
});

// Admin/Owner endpoint to manage and reset passwords for any staff or student
router.post("/users/:id/change-password", authMiddleware(["owner", "admin", "administrator"]), async (req, res): Promise<void> => {
  const { newPassword } = req.body;
  if (!newPassword || String(newPassword).length < 6) {
    res.status(400).json({ error: "New password must be at least 6 characters" });
    return;
  }
  const hash = await bcrypt.hash(String(newPassword), 10);
  const updated = await UserModel.findByIdAndUpdate(req.params["id"], { passwordHash: hash });
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ message: "Password updated successfully" });
});

router.delete("/users/:id", authMiddleware(["owner", "admin", "administrator"]), async (req, res): Promise<void> => {
  await UserModel.findByIdAndDelete(req.params["id"]);
  res.json({ message: "Deleted" });
});

export default router;
