import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string | null;
  semester?: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? "college-erp-secret-key-2026";

export function authMiddleware(roles?: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = req.headers["authorization"];
    if (!auth?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const decoded = jwt.verify(auth.slice(7), JWT_SECRET) as JwtPayload;
      req.user = decoded;
      if (roles && !roles.includes(decoded.role)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  };
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}
