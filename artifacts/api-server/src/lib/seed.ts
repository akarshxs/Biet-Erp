import bcrypt from "bcryptjs";
import {
  UserModel, DepartmentModel, SubjectModel, AssignmentModel,
  NoticeModel, EventModel, PlacementModel, BookModel, FeeModel, NotificationModel,
} from "../models/index.js";
import { genId, today } from "./helpers.js";
import { logger } from "./logger.js";

export async function seedDatabase() {
  // Skip if already seeded
  const existing = await UserModel.findOne({ email: "owner@gmail.com" }).lean();
  if (existing) return;

  logger.info("Seeding database...");

  // ── Departments ──────────────────────────────────────────────────────────────
  const depts = [
    { _id: genId(), name: "Computer Science & Engineering", code: "CSE" },
    { _id: genId(), name: "Information Science & Engineering", code: "ISE" },
    { _id: genId(), name: "AI & Machine Learning", code: "AIML" },
    { _id: genId(), name: "Electronics & Communication", code: "ECE" },
    { _id: genId(), name: "Electrical & Electronics", code: "EEE" },
  ];
  await DepartmentModel.insertMany(depts);

  // ── Users ─────────────────────────────────────────────────────────────────────
  const pass = async (p: string) => bcrypt.hash(p, 10);
  const ownerHash  = await pass("Owner123");
  const teacherHash = await pass("Teacher@123");
  const studentHash = await pass("Student@123");

  const ownerId    = genId();
  const adminId    = genId();
  const teacher1Id = genId();
  const teacher2Id = genId();
  const teacher3Id = genId();
  const student1Id = genId();
  const student2Id = genId();
  const student3Id = genId();
  const t = today();

  await UserModel.insertMany([
    { _id: ownerId,    email: "owner@gmail.com",            passwordHash: ownerHash,              name: "Raj Kumar",          role: "owner",   isActive: true, createdAt: t },
    { _id: adminId,    email: "admin@college.edu",           passwordHash: await pass("Admin@123"), name: "Meera Singh",        role: "admin",   department: "CSE",  isActive: true, createdAt: t },
    { _id: teacher1Id, email: "priya.sharma@college.edu",    passwordHash: teacherHash,             name: "Dr. Priya Sharma",   role: "teacher", department: "CSE",  designation: "Professor",            qualification: "Ph.D CS",     isActive: true, createdAt: t },
    { _id: teacher2Id, email: "arjun.verma@college.edu",     passwordHash: teacherHash,             name: "Dr. Arjun Verma",    role: "teacher", department: "ISE",  designation: "Associate Professor",  qualification: "Ph.D IT",     isActive: true, createdAt: t },
    { _id: teacher3Id, email: "kavya.nair@college.edu",      passwordHash: teacherHash,             name: "Prof. Kavya Nair",   role: "teacher", department: "AIML", designation: "Assistant Professor",  qualification: "M.Tech ML",   isActive: true, createdAt: t },
    { _id: student1Id, email: "aarav@student.edu",           passwordHash: studentHash,             name: "Aarav Patel",        role: "student", department: "CSE",  semester: 3, rollNumber: "1CS21CS001", admissionYear: 2021, batch: "2021-25", isActive: true, createdAt: t },
    { _id: student2Id, email: "ananya@student.edu",          passwordHash: studentHash,             name: "Ananya Sharma",      role: "student", department: "AIML", semester: 3, rollNumber: "1AI21AI012", admissionYear: 2021, batch: "2021-25", isActive: true, createdAt: t },
    { _id: student3Id, email: "rohan@student.edu",           passwordHash: studentHash,             name: "Rohan Mehta",        role: "student", department: "ISE",  semester: 5, rollNumber: "1IS20IS008", admissionYear: 2020, batch: "2020-24", isActive: true, createdAt: t },
    { _id: genId(),    email: "administrator@biet.edu",      passwordHash: await pass("Admin@123"), name: "BIET Administrator", role: "admin",   department: "CSE",  isActive: true, createdAt: t },
    { _id: genId(),    email: "hod@biet.edu",                passwordHash: await pass("Hod@123"),   name: "Dr. R. K. Sharma (HOD)", role: "hod", department: "CSE",  designation: "Head of Department", qualification: "Ph.D CS", isActive: true, createdAt: t },
    { _id: genId(),    email: "principal@biet.edu",          passwordHash: await pass("Principal@123"), name: "Dr. S. N. Singh (Principal)", role: "principal", designation: "Principal / Director", qualification: "Ph.D, FIE", isActive: true, createdAt: t },
    { _id: genId(),    email: "parent@biet.edu",             passwordHash: await pass("Parent@123"), name: "Rajesh Patel (Parent)", role: "parent", isActive: true, createdAt: t },
  ]);

  // ── Subjects ──────────────────────────────────────────────────────────────────
  const subjects = [
    { _id: genId(), code: "CS301",  name: "Data Structures & Algorithms",    department: "CSE",  semester: 3, credits: 4, teacherId: teacher1Id },
    { _id: genId(), code: "CS302",  name: "Operating Systems",               department: "CSE",  semester: 3, credits: 4, teacherId: teacher1Id },
    { _id: genId(), code: "CS303",  name: "Database Management Systems",     department: "CSE",  semester: 3, credits: 3, teacherId: teacher1Id },
    { _id: genId(), code: "CS501",  name: "Computer Networks",               department: "CSE",  semester: 5, credits: 4, teacherId: teacher1Id },
    { _id: genId(), code: "IS301",  name: "Software Engineering",            department: "ISE",  semester: 3, credits: 4, teacherId: teacher2Id },
    { _id: genId(), code: "IS501",  name: "Web Technologies",                department: "ISE",  semester: 5, credits: 3, teacherId: teacher2Id },
    { _id: genId(), code: "AIM301", name: "Machine Learning Foundations",    department: "AIML", semester: 3, credits: 4, teacherId: teacher3Id },
    { _id: genId(), code: "AIM501", name: "Deep Learning & Neural Networks", department: "AIML", semester: 5, credits: 4, teacherId: teacher3Id },
  ];
  await SubjectModel.insertMany(subjects);

  // ── Assignments ───────────────────────────────────────────────────────────────
  await AssignmentModel.insertMany([
    { _id: genId(), title: "Implement BST Operations",     description: "Write a complete Binary Search Tree implementation with insert, delete, search, and all traversal algorithms. Include time complexity analysis.", subjectId: subjects[0]._id, teacherId: teacher1Id, department: "CSE",  semester: 3, dueDate: "2026-08-15", maxMarks: 50,  attachments: [], createdAt: t },
    { _id: genId(), title: "Linear Regression from Scratch", description: "Implement linear regression using gradient descent without ML libraries. Test on a real dataset and report MSE, R-squared metrics.",           subjectId: subjects[6]._id, teacherId: teacher3Id, department: "AIML", semester: 3, dueDate: "2026-08-20", maxMarks: 100, attachments: [], createdAt: t },
    { _id: genId(), title: "ER Diagram — Hospital System", description: "Design a complete ER diagram for a Hospital Management System including all entities, relationships, cardinalities, and constraints.",             subjectId: subjects[2]._id, teacherId: teacher1Id, department: "CSE",  semester: 3, dueDate: "2026-08-10", maxMarks: 30,  attachments: [], createdAt: t },
  ]);

  // ── Notices ────────────────────────────────────────────────────────────────────
  await NoticeModel.insertMany([
    { _id: genId(), title: "Mid-Semester Examination Schedule Released", content: "The mid-semester examination schedule for all departments has been released. Students are advised to check the timetable on the portal and prepare accordingly. The exams will commence from August 25th, 2026.", authorId: ownerId, authorName: "Raj Kumar",   priority: "high",   target: "all", isActive: true, createdAt: t },
    { _id: genId(), title: "Campus Placement Drive — TCS & Infosys",    content: "A mega placement drive is scheduled for final year students. TCS and Infosys will be visiting campus on August 30th. Eligible students (CGPA >= 7.0) should register through the Placements module before August 20th.", authorId: adminId, authorName: "Meera Singh", priority: "high",   target: "all", isActive: true, createdAt: t },
    { _id: genId(), title: "Library Timings Extended",                   content: "The central library timings have been extended to 8 PM on weekdays and 6 PM on weekends during the examination period. Students are encouraged to make use of the additional study hours.",                            authorId: ownerId, authorName: "Raj Kumar",   priority: "medium", target: "all", isActive: true, createdAt: t },
  ]);

  // ── Events ─────────────────────────────────────────────────────────────────────
  await EventModel.insertMany([
    { _id: genId(), title: "HackSphere 2026 — National Hackathon", description: "Join us for the biggest hackathon of the year! 24-hour coding marathon with prizes worth ₹5 Lakhs. Teams of 2-4. Register now.", type: "hackathon", date: "2026-08-18", venue: "Main Auditorium & CS Labs", organizer: "CSE Department", maxParticipants: 200, registrations: [], createdAt: t },
    { _id: genId(), title: "AI/ML Workshop — Hands-on Deep Learning",   description: "A 2-day intensive workshop covering PyTorch, CNNs, Transfer Learning, and deployment. Industry experts from Google Brain and Microsoft Research.", type: "workshop",   date: "2026-08-22", venue: "Seminar Hall B",             organizer: "AIML Department",  maxParticipants: 80,  registrations: [], createdAt: t },
    { _id: genId(), title: "Cultural Fest — Synergy 2026",               description: "Annual cultural extravaganza featuring music, dance, drama, art competitions, and celebrity performances. Open to all students.",                  type: "cultural",   date: "2026-09-05", venue: "Open Amphitheater",          organizer: "Student Council",  maxParticipants: 1000, registrations: [], createdAt: t },
  ]);

  // ── Placements ─────────────────────────────────────────────────────────────────
  await PlacementModel.insertMany([
    { _id: genId(), companyName: "Google India",        title: "Software Engineer — L3",     description: "Join Google's engineering team working on large-scale distributed systems. 3 rounds: DSA + System Design + Behavioral.", eligibility: "CGPA >= 8.0, Any CS/IT branch, 2026 batch", salary: "₹35 LPA + Stock Options", deadline: "2026-08-25", status: "open",     registrations: [], createdAt: t },
    { _id: genId(), companyName: "Microsoft",           title: "SDE-1 — Azure Platform",     description: "Build cloud infrastructure at Microsoft Azure. Work on real products used by millions.",                                    eligibility: "CGPA >= 7.5, CSE/ISE/AIML, 2026 batch",    salary: "₹28 LPA",                deadline: "2026-08-30", status: "open",     registrations: [], createdAt: t },
    { _id: genId(), companyName: "Wipro Technologies",  title: "Project Engineer",           description: "Work on enterprise software projects across domains. Training provided.",                                                   eligibility: "CGPA >= 6.0, Any branch, 2026 batch",       salary: "₹6.5 LPA",               deadline: "2026-09-10", status: "upcoming", registrations: [], createdAt: t },
  ]);

  // ── Books ──────────────────────────────────────────────────────────────────────
  await BookModel.insertMany([
    { _id: genId(), title: "Introduction to Algorithms (CLRS)", author: "Cormen, Leiserson, Rivest, Stein", isbn: "9780262046305", department: "CSE",  quantity: 5, available: 4, createdAt: t },
    { _id: genId(), title: "Deep Learning",                      author: "Ian Goodfellow, Yoshua Bengio",   isbn: "9780262035613", department: "AIML", quantity: 3, available: 2, createdAt: t },
    { _id: genId(), title: "Database System Concepts",           author: "Silberschatz, Korth, Sudarshan",  isbn: "9780078022159", department: "CSE",  quantity: 4, available: 3, createdAt: t },
    { _id: genId(), title: "Computer Networks",                  author: "Andrew S. Tanenbaum",              isbn: "9780132126953", department: "CSE",  quantity: 3, available: 3, createdAt: t },
    { _id: genId(), title: "The Pragmatic Programmer",           author: "David Thomas, Andrew Hunt",        isbn: "9780135957059", department: "ISE",  quantity: 2, available: 2, createdAt: t },
  ]);

  // ── Fees ───────────────────────────────────────────────────────────────────────
  await FeeModel.insertMany([
    { _id: genId(), studentId: student1Id, feeType: "Tuition Fee", amount: "85000", paidAmount: "85000", dueDate: "2026-07-31", status: "paid",    academicYear: "2026", createdAt: t },
    { _id: genId(), studentId: student1Id, feeType: "Hostel Fee",  amount: "45000", paidAmount: "0",     dueDate: "2026-08-15", status: "pending", academicYear: "2026", createdAt: t },
    { _id: genId(), studentId: student2Id, feeType: "Tuition Fee", amount: "85000", paidAmount: "42500", dueDate: "2026-07-31", status: "partial", academicYear: "2026", createdAt: t },
    { _id: genId(), studentId: student3Id, feeType: "Tuition Fee", amount: "85000", paidAmount: "85000", dueDate: "2026-07-31", status: "paid",    academicYear: "2026", createdAt: t },
  ]);

  // ── Notifications ──────────────────────────────────────────────────────────────
  await NotificationModel.insertMany([
    { _id: genId(), userId: student1Id, title: "New Assignment Posted", message: "Dr. Priya Sharma has posted a new assignment: Implement BST Operations. Due: Aug 15.", read: false, createdAt: t },
    { _id: genId(), userId: student1Id, title: "Fee Due Reminder",      message: "Your Hostel Fee of ₹45,000 is due on August 15, 2026. Please pay to avoid late fees.",  read: false, createdAt: t },
    { _id: genId(), userId: teacher1Id, title: "Mid-Sem Exam Schedule", message: "The mid-semester examination schedule has been finalized. Please review and prepare accordingly.", read: false, createdAt: t },
  ]);

  logger.info("Database seeded successfully");
}
