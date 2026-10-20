import path from "node:path";
import fs from "node:fs";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { seedDatabase } from "./lib/seed.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
      res(res) { return { statusCode: res.statusCode }; },
    },
  }),
);
app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve frontend static files if built (Single-service deployment mode)
const candidateStaticDirs = [
  path.resolve(process.cwd(), "artifacts/college-erp/dist/public"),
  path.resolve(process.cwd(), "../college-erp/dist/public"),
  path.resolve(process.cwd(), "dist/public"),
  path.resolve(process.cwd(), "public"),
];

const resolvedStaticDir = candidateStaticDirs.find((dir) => fs.existsSync(path.join(dir, "index.html")));

if (resolvedStaticDir) {
  logger.info({ staticDir: resolvedStaticDir }, "Serving frontend static assets");
  app.use(express.static(resolvedStaticDir));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(resolvedStaticDir, "index.html"));
  });
}

// Seed the local JSON store on first run.
seedDatabase().catch((err) => logger.error({ err }, "Startup failed"));

export default app;
