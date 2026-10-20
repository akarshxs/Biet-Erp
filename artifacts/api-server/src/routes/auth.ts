import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/index.js";
import { authMiddleware, signToken } from "../middlewares/auth.js";
import { genId, today } from "../lib/helpers.js";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400).json({ error: "Email and password required" }); return; }
  const normalizedEmail = String(email).trim().toLowerCase();
  const allUsers = await UserModel.find();
  const user = allUsers.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
  if (!user || !user.isActive) { res.status(401).json({ error: "Invalid credentials" }); return; }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }
  const token = signToken({ id: user._id as string, email: user.email, name: user.name, role: user.role, department: user.department, semester: user.semester });
  const { passwordHash: _, ...safe } = user as any;
  res.json({ token, user: { ...safe, id: safe._id } });
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const { email, password, name, phone, department, year, semester, rollNumber } = req.body;
  if (!email || !password || !name) { 
    res.status(400).json({ error: "Name, email, and password are required" }); 
    return; 
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters long" });
    return;
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const allUsers = await UserModel.find();
  const existingEmail = allUsers.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
  if (existingEmail) { 
    res.status(400).json({ error: "An account with this email already exists" }); 
    return; 
  }
  if (rollNumber && String(rollNumber).trim()) {
    const normRoll = String(rollNumber).trim().toLowerCase();
    const existingRoll = allUsers.find((u: any) => u.rollNumber?.toLowerCase() === normRoll);
    if (existingRoll) {
      res.status(400).json({ error: "A student with this roll number already exists" });
      return;
    }
  }

  const numYear = year ? Number(year) : 1;
  const numSem = semester ? Number(semester) : (numYear * 2 - 1);
  const currentYear = new Date().getFullYear();
  const admissionYear = currentYear - (numYear - 1);
  const batch = `${admissionYear}-${admissionYear + 4}`;

  const hash = await bcrypt.hash(password, 10);
  const id = genId();
  const user = await UserModel.create({
    _id: id,
    email: normalizedEmail,
    passwordHash: hash,
    name: String(name).trim(),
    role: "student", // Strictly locked to student for open signup
    phone: phone ? String(phone).trim() : undefined,
    department: department ? String(department).trim() : undefined,
    year: numYear,
    semester: numSem,
    rollNumber: rollNumber ? String(rollNumber).trim() : undefined,
    admissionYear,
    batch,
    isActive: true,
    createdAt: today(),
  });
  const token = signToken({ 
    id: user._id as string, 
    email: user.email, 
    name: user.name, 
    role: user.role,
    department: user.department,
    semester: user.semester
  });
  const doc = user.toJSON() as any;
  const { passwordHash: _, ...safe } = doc;
  res.status(201).json({ token, user: { ...safe, id: safe._id } });
});

router.get("/auth/me", authMiddleware(), async (req, res): Promise<void> => {
  const user = await UserModel.findById(req.user!.id).lean();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const { passwordHash: _, ...safe } = user as any;
  res.json({ ...safe, id: safe._id });
});

router.post("/auth/change-password", authMiddleware(), async (req, res): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const user = await UserModel.findById(req.user!.id).lean();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) { res.status(400).json({ error: "Current password is incorrect" }); return; }
  const hash = await bcrypt.hash(newPassword, 10);
  await UserModel.findByIdAndUpdate(user._id, { passwordHash: hash });
  res.json({ message: "Password changed successfully" });
});

router.put("/auth/update-profile", authMiddleware(), async (req, res): Promise<void> => {
  const { name, phone, address, profileImage } = req.body;
  const user = await UserModel.findByIdAndUpdate(req.user!.id, { name, phone, address, profileImage }, { new: true }).lean();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const { passwordHash: _, ...safe } = user as any;
  res.json({ ...safe, id: safe._id });
});

export default router;
