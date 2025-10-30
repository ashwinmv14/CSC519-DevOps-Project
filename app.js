import express from "express";
import * as db from "./data.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;
const FEATURE_ANALYTICS = (process.env.FEATURE_ANALYTICS || "false") === "true";
const FEATURE_HEALTH = (process.env.FEATURE_HEALTH || "true") === "true";

app.get("/", (_req, res) => res.json({ message: "TaskTracker Node API" }));

app.get("/health", (_req, res) => {
  if (!FEATURE_HEALTH) return res.status(503).json({ status: "disabled" });
  return res.json({ status: "ok" });
});

app.get("/tasks", (_req, res) => res.json(db.listTasks()));

app.post("/tasks", (req, res) => {
  const { title, description = "" } = req.query.title ? req.query : req.body;
  if (!title) return res.status(400).json({ error: "title required" });
  try {
    const t = db.createTask(title, description);
    res.json(t);
  } catch {
    res.status(400).json({ error: "duplicate title" });
  }
});

app.delete("/tasks/:id", (req, res) => {
  const ok = db.deleteTask(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: "not found" });
  res.json({ deleted: Number(req.params.id) });
});

export default app;

// only start server if not running under test
if (!process.env.JEST_WORKER_ID) {
  app.listen(PORT, () => console.log(`TaskTracker listening on http://0.0.0.0:${PORT}`));
}
