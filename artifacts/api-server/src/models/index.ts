import fs from "node:fs/promises";
import path from "node:path";
import { genId, today } from "../lib/helpers.js";

type Row = Record<string, any>;
type Filter = Record<string, any>;

import fsSync from "node:fs";

// The portable build intentionally uses plain JSON files instead of a database.
// Set LOCAL_DATA_DIR when a different data location is required.
const DATA_DIR = path.resolve(
  process.env["LOCAL_DATA_DIR"] ||
  (fsSync.existsSync(path.resolve(process.cwd(), "artifacts/api-server/data"))
    ? path.resolve(process.cwd(), "artifacts/api-server/data")
    : path.resolve(process.cwd(), "data"))
);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function matches(row: Row, filter: Filter): boolean {
  return Object.entries(filter).every(([key, expected]) => {
    if (key === "$or") return expected.some((item: Filter) => matches(row, item));
    const actual = row[key];
    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
      if ("$in" in expected) return expected.$in.includes(actual);
      if ("$regex" in expected) {
        const flags = expected.$options || "";
        return new RegExp(expected.$regex, flags).test(String(actual ?? ""));
      }
      if ("$ne" in expected) return actual !== expected.$ne;
    }
    return actual === expected;
  });
}

function applyUpdate(row: Row, update: Row): Row {
  const next = { ...row };
  for (const [key, value] of Object.entries(update)) {
    if (key === "$inc") {
      for (const [field, amount] of Object.entries(value as Row)) {
        next[field] = Number(next[field] || 0) + Number(amount);
      }
    } else if (value !== undefined) {
      next[key] = value;
    }
  }
  return next;
}

class LocalQuery<T extends Row | Row[] | null> {
  private sortSpec: Row | null = null;
  private maxRows: number | null = null;
  private projection: Row | null = null;

  constructor(private readonly loader: () => Promise<T>) {}

  sort(spec: Row) {
    this.sortSpec = spec;
    return this;
  }

  limit(value: number) {
    this.maxRows = value;
    return this;
  }

  select(spec: Row) {
    this.projection = spec;
    return this;
  }

  // Kept for route compatibility with the existing route files.
  lean() {
    return this;
  }

  populate() {
    return this;
  }

  async execute(): Promise<T> {
    let result: any = await this.loader();
    if (Array.isArray(result)) {
      if (this.sortSpec) {
        const entries = Object.entries(this.sortSpec);
        result.sort((a, b) => {
          for (const [field, direction] of entries) {
            const left = a[field];
            const right = b[field];
            if (left === right) continue;
            return (left > right ? 1 : -1) * Number(direction);
          }
          return 0;
        });
      }
      if (this.maxRows !== null) result = result.slice(0, this.maxRows);
      if (this.projection) {
        const keys = Object.keys(this.projection).filter((key) => this.projection?.[key]);
        result = result.map((item: Row) => {
          const projected: Row = { _id: item._id };
          for (const key of keys) projected[key] = item[key];
          return projected;
        });
      }
    }
    return clone(result);
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class LocalModel {
  constructor(private readonly name: string) {}

  private get file() {
    return path.join(DATA_DIR, `${this.name}.json`);
  }

  private async read(): Promise<Row[]> {
    try {
      return JSON.parse(await fs.readFile(this.file, "utf8"));
    } catch {
      return [];
    }
  }

  private async write(rows: Row[]) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const temp = `${this.file}.tmp`;
    await fs.writeFile(temp, JSON.stringify(rows, null, 2), "utf8");
    await fs.rename(temp, this.file);
  }

  find(filter: Filter = {}, projection?: Row) {
    const query = new LocalQuery<Row[]>(async () => {
      const rows = (await this.read()).filter((row) => matches(row, filter));
      if (projection) {
        const keys = Object.keys(projection).filter((key) => projection[key]);
        return rows.map((row) => {
          const projected: Row = { _id: row._id };
          for (const key of keys) projected[key] = row[key];
          return projected;
        });
      }
      return rows;
    });
    return query;
  }

  findOne(filter: Filter = {}) {
    return new LocalQuery<Row | null>(async () => {
      const rows = await this.read();
      return rows.find((row) => matches(row, filter)) || null;
    });
  }

  findById(id: string | string[]) {
    const normalizedId = Array.isArray(id) ? id[0] : id;
    return new LocalQuery<Row | null>(async () => {
      const rows = await this.read();
      return rows.find((row) => String(row._id) === String(normalizedId)) || null;
    });
  }

  async countDocuments(filter: Filter = {}) {
    return (await this.read()).filter((row) => matches(row, filter)).length;
  }

  async create(payload: Row): Promise<any> {
    const rows = await this.read();
    const row = { _id: payload._id || genId(), createdAt: payload.createdAt || today(), ...payload };
    rows.push(row);
    await this.write(rows);
    return { ...clone(row), toJSON: () => clone(row) };
  }

  async insertMany(payloads: Row[]): Promise<any[]> {
    const rows = await this.read();
    const added = payloads.map((payload) => ({ _id: payload._id || genId(), ...payload }));
    await this.write([...rows, ...added]);
    return added.map((row) => ({ ...clone(row), toJSON: () => clone(row) }));
  }

  findByIdAndUpdate(id: string | string[], update: Row, options: Row = {}) {
    const normalizedId = Array.isArray(id) ? id[0] : id;
    return new LocalQuery<Row | null>(async () => {
      const rows = await this.read();
      const index = rows.findIndex((row) => String(row._id) === String(normalizedId));
      if (index < 0) return null;
      const updated = applyUpdate(rows[index], update);
      rows[index] = updated;
      await this.write(rows);
      return options.new === false ? rows[index] : updated;
    });
  }

  findByIdAndDelete(id: string | string[]) {
    const normalizedId = Array.isArray(id) ? id[0] : id;
    return new LocalQuery<Row | null>(async () => {
      const rows = await this.read();
      const index = rows.findIndex((row) => String(row._id) === String(normalizedId));
      if (index < 0) return null;
      const [removed] = rows.splice(index, 1);
      await this.write(rows);
      return removed;
    });
  }
}

export const UserModel = new LocalModel("users");
export const DepartmentModel = new LocalModel("departments");
export const SubjectModel = new LocalModel("subjects");
export const AttendanceModel = new LocalModel("attendance");
export const AssignmentModel = new LocalModel("assignments");
export const SubmissionModel = new LocalModel("submissions");
export const ResultModel = new LocalModel("results");
export const FeeModel = new LocalModel("fees");
export const NoticeModel = new LocalModel("notices");
export const EventModel = new LocalModel("events");
export const PlacementModel = new LocalModel("placements");
export const TimetableModel = new LocalModel("timetable");
export const NoteModel = new LocalModel("notes");
export const BookModel = new LocalModel("books");
export const BookIssueModel = new LocalModel("book-issues");
export const MessageModel = new LocalModel("messages");
export const NotificationModel = new LocalModel("notifications");
export const AuditLogModel = new LocalModel("audit-logs");
export const HostelModel = new LocalModel("hostel");
export const TransportModel = new LocalModel("transport");
export const ScholarshipModel = new LocalModel("scholarships");
export const AcademicCalendarModel = new LocalModel("academic-calendar");
export const LeaveModel = new LocalModel("leave");
export const CertificateModel = new LocalModel("certificates");
export const CourseModel = new LocalModel("courses");
export const GalleryModel = new LocalModel("gallery");
export const DocumentModel = new LocalModel("documents");