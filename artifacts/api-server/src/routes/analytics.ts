import { Router, type IRouter } from "express";
import { UserModel, DepartmentModel, AttendanceModel, ResultModel, FeeModel } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/analytics/overview", authMiddleware(["owner", "admin", "administrator", "principal"]), async (req, res): Promise<void> => {
  const [totalStudents, totalTeachers, depts] = await Promise.all([
    UserModel.countDocuments({ role: "student", isActive: true }),
    UserModel.countDocuments({ role: "teacher", isActive: true }),
    DepartmentModel.find().lean(),
  ]);

  const attendanceRecords = await AttendanceModel.find().lean();
  const total = attendanceRecords.length;
  const present = (attendanceRecords as any[]).filter(r => r.status === "present" || r.status === "late").length;
  const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;

  const fees = await FeeModel.find().lean();
  const totalFees = (fees as any[]).reduce((sum, f) => sum + Number(f.amount), 0);
  const collectedFees = (fees as any[]).reduce((sum, f) => sum + Number(f.paidAmount), 0);

  const weeklyData = [
    { name: "Mon", attendance: 85 },
    { name: "Tue", attendance: 88 },
    { name: "Wed", attendance: 92 },
    { name: "Thu", attendance: 81 },
    { name: "Fri", attendance: 89 },
  ];

  const deptData = await Promise.all((depts as any[]).map(async (d) => {
    const count = await UserModel.countDocuments({ role: "student", department: d.code });
    return { name: d.code, students: count };
  }));

  res.json({
    totalStudents,
    totalTeachers,
    totalDepartments: depts.length,
    attendancePercentage,
    totalFees,
    collectedFees,
    pendingFees: totalFees - collectedFees,
    weeklyData,
    deptData,
  });
});

router.get("/analytics/attendance", authMiddleware(["owner", "admin", "administrator", "principal"]), async (req, res): Promise<void> => {
  const depts = await DepartmentModel.find().lean();
  const weeklyData = [
    { name: "Mon", attendance: 85 }, { name: "Tue", attendance: 88 },
    { name: "Wed", attendance: 92 }, { name: "Thu", attendance: 81 }, { name: "Fri", attendance: 89 },
  ];
  const departmentData = await Promise.all((depts as any[]).map(async (d) => {
    const students = await UserModel.find({ department: d.code, role: "student" }).lean();
    const studentIds = (students as any[]).map(s => String(s._id));
    const records = await AttendanceModel.find({ studentId: { $in: studentIds } }).lean();
    const p = (records as any[]).filter(r => r.status === "present" || r.status === "late").length;
    const percentage = records.length > 0 ? Math.round((p / records.length) * 100) : 0;
    return { department: d.code, percentage };
  }));
  res.json({ weeklyData, departmentData });
});

router.get("/analytics/results", authMiddleware(["owner", "admin", "administrator", "principal"]), async (req, res): Promise<void> => {
  const allResults = await ResultModel.find({}, { grade: 1, totalMarks: 1 }).lean();
  const gradeMap: Record<string, number> = {};
  for (const r of allResults as any[]) gradeMap[r.grade] = (gradeMap[r.grade] ?? 0) + 1;
  const gradeDistribution = Object.entries(gradeMap).map(([grade, count]) => ({ grade, count }));
  const passed = (allResults as any[]).filter(r => r.grade !== "F").length;
  const passPercentage = allResults.length > 0 ? Math.round((passed / allResults.length) * 100) : 0;
  res.json({ gradeDistribution, averageSgpa: 7.2, passPercentage });
});

export default router;
