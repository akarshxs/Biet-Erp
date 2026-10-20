import { Router, type IRouter } from "express";
import {
  AcademicCalendarModel,
  AssignmentModel,
  AttendanceModel,
  BookModel,
  CertificateModel,
  CourseModel,
  DocumentModel,
  EventModel,
  FeeModel,
  GalleryModel,
  HostelModel,
  LeaveModel,
  MessageModel,
  NoteModel,
  NoticeModel,
  PlacementModel,
  ResultModel,
  ScholarshipModel,
  SubjectModel,
  TimetableModel,
  TransportModel,
} from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";

const router: IRouter = Router();
const staffRoles = ["owner", "admin", "administrator", "teacher", "hod", "principal"];
const adminRoles = ["owner", "admin", "administrator", "principal"];
const definitions = {
  subjects: { model: SubjectModel, fields: ["code", "name", "department", "semester", "credits", "teacherId"], roles: staffRoles },
  attendance: { model: AttendanceModel, fields: ["studentId", "subjectId", "date", "status", "markedBy"], roles: staffRoles },
  assignments: { model: AssignmentModel, fields: ["title", "description", "subjectId", "teacherId", "department", "semester", "dueDate", "maxMarks"], roles: staffRoles },
  notes: { model: NoteModel, fields: ["title", "subjectId", "topic", "content", "authorId"], roles: staffRoles },
  results: { model: ResultModel, fields: ["studentId", "subjectId", "examName", "marks", "maxMarks", "grade"], roles: staffRoles },
  fees: { model: FeeModel, fields: ["studentId", "feeType", "amount", "paidAmount", "dueDate", "academicYear", "status"], roles: adminRoles },
  timetable: { model: TimetableModel, fields: ["subjectId", "teacherId", "day", "startTime", "endTime", "room"], roles: staffRoles },
  notices: { model: NoticeModel, fields: ["title", "content", "category", "audience", "authorId", "publishedAt"], roles: staffRoles },
  events: { model: EventModel, fields: ["title", "description", "type", "date", "venue", "organizer", "maxParticipants"], roles: staffRoles },
  placements: { model: PlacementModel, fields: ["companyName", "title", "description", "eligibility", "salary", "deadline", "status"], roles: adminRoles },
  library: { model: BookModel, fields: ["title", "author", "isbn", "department", "quantity", "available"], roles: adminRoles },
  hostel: { model: HostelModel, fields: ["studentId", "room", "building", "bed", "status", "checkIn"], roles: adminRoles },
  transport: { model: TransportModel, fields: ["studentId", "route", "vehicle", "stop", "fee", "status"], roles: adminRoles },
  scholarships: { model: ScholarshipModel, fields: ["studentId", "name", "provider", "amount", "deadline", "status"], roles: adminRoles },
  "academic-calendar": { model: AcademicCalendarModel, fields: ["title", "type", "startDate", "endDate", "description"], roles: staffRoles },
  leave: { model: LeaveModel, fields: ["userId", "leaveType", "startDate", "endDate", "reason", "status"], roles: staffRoles },
  certificates: { model: CertificateModel, fields: ["studentId", "certificateType", "requestedAt", "status"], roles: adminRoles },
  courses: { model: CourseModel, fields: ["code", "title", "department", "semester", "credits", "description"], roles: adminRoles },
  gallery: { model: GalleryModel, fields: ["title", "description", "category", "imageUrl", "publishedAt"], roles: staffRoles },
  documents: { model: DocumentModel, fields: ["name", "category", "ownerId", "fileUrl", "status"], roles: adminRoles },
  messages: { model: MessageModel, fields: ["senderId", "senderName", "receiverId", "content", "read"], roles: staffRoles },
} as const;

type Resource = keyof typeof definitions;
type RecordFilter = Record<string, unknown>;
const knownResource = (name: string): Resource | undefined =>
  Object.prototype.hasOwnProperty.call(definitions, name) ? name as Resource : undefined;

const privateRecordFilters: Partial<Record<Resource, (userId: string) => RecordFilter>> = {
  attendance: (userId) => ({ studentId: userId }),
  results: (userId) => ({ studentId: userId }),
  fees: (userId) => ({ studentId: userId }),
  hostel: (userId) => ({ studentId: userId }),
  transport: (userId) => ({ studentId: userId }),
  scholarships: (userId) => ({ studentId: userId }),
  certificates: (userId) => ({ studentId: userId }),
  leave: (userId) => ({ userId }),
  documents: (userId) => ({ ownerId: userId }),
  messages: (userId) => ({ $or: [{ senderId: userId }, { receiverId: userId }] }),
};

router.get("/records/:resource", authMiddleware(), async (req, res): Promise<void> => {
  const resource = knownResource(String(req.params["resource"] ?? ""));
  if (!resource) { res.status(404).json({ error: "Unknown module" }); return; }
  const { model } = definitions[resource];
  const user = req.user!;
  const filter = staffRoles.includes(user.role) ? {} : privateRecordFilters[resource]?.(user.id) ?? {};
  const rows = await model.find(filter).sort({ createdAt: -1 }).lean();
  res.json((rows as Record<string, unknown>[]).map((row) => ({ ...row, id: row._id })));
});

router.post("/records/:resource", authMiddleware(), async (req, res): Promise<void> => {
  const resource = knownResource(String(req.params["resource"] ?? ""));
  if (!resource) { res.status(404).json({ error: "Unknown module" }); return; }
  const definition = definitions[resource];
  if (!definition.roles.includes(req.user!.role as never)) { res.status(403).json({ error: "You do not have permission to edit this module" }); return; }
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) { res.status(400).json({ error: "A record is required" }); return; }
  const input: Record<string, unknown> = {};
  for (const key of definition.fields) if (req.body[key] !== undefined) input[key] = req.body[key];
  if (!Object.keys(input).length) { res.status(400).json({ error: "Enter at least one field" }); return; }
  if (resource === "attendance") input["markedBy"] = req.user!.id;
  if (resource === "notes" || resource === "notices") {
    input["authorId"] = req.user!.id;
  }
  if (resource === "messages") {
    input["senderId"] = req.user!.id;
    input["senderName"] = req.user!.name;
  }
  const row = await definition.model.create(input);
  const data = row.toJSON ? row.toJSON() : row;
  res.status(201).json({ ...data, id: data._id });
});

router.patch("/records/:resource/:id", authMiddleware(), async (req, res): Promise<void> => {
  const resource = knownResource(String(req.params["resource"] ?? ""));
  if (!resource) { res.status(404).json({ error: "Unknown module" }); return; }
  const definition = definitions[resource];
  if (!definition.roles.includes(req.user!.role as never)) { res.status(403).json({ error: "You do not have permission to edit this module" }); return; }
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) { res.status(400).json({ error: "A record is required" }); return; }
  const input: Record<string, unknown> = {};
  for (const key of definition.fields) if (req.body[key] !== undefined) input[key] = req.body[key];
  if (!Object.keys(input).length) { res.status(400).json({ error: "Enter at least one field" }); return; }
  if (resource === "notes" || resource === "notices") delete input["authorId"];
  if (resource === "messages") {
    delete input["senderId"];
    delete input["senderName"];
  }
  if (resource === "attendance") input["markedBy"] = req.user!.id;
  const row = await definition.model.findByIdAndUpdate(req.params["id"], input, { new: true }).lean() as Record<string, unknown> | null;
  if (!row) { res.status(404).json({ error: "Record not found" }); return; }
  res.json({ ...row, id: row._id });
});

router.delete("/records/:resource/:id", authMiddleware(), async (req, res): Promise<void> => {
  const resource = knownResource(String(req.params["resource"] ?? ""));
  if (!resource) { res.status(404).json({ error: "Unknown module" }); return; }
  const definition = definitions[resource];
  if (!definition.roles.includes(req.user!.role as never)) { res.status(403).json({ error: "You do not have permission to edit this module" }); return; }
  const removed = await definition.model.findByIdAndDelete(req.params["id"]).lean();
  if (!removed) { res.status(404).json({ error: "Record not found" }); return; }
  res.json({ message: "Record deleted" });
});

export default router;
