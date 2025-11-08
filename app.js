// app.js
const express = require("express");
const { listTasks, createTask, deleteTask } = require("./data");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Health
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

// List
app.get("/tasks", (_req, res) => res.json(listTasks()));

// Create
app.post("/tasks", (req, res) => {
  const { title, description = "" } = req.body || {};
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Title is required" });
  }
  try {
    const created = createTask(title.trim(), description);
    return res.status(201).json(created);
  } catch (e) {
    // likely UNIQUE(title) violation
    return res.status(409).json({ error: "Task title must be unique" });
  }
});

// Delete
app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });
  const ok = deleteTask(id);
  if (!ok) return res.status(404).json({ error: "Task not found" });
  return res.json({ message: "Task deleted" });
});

// Start if run directly
if (require.main === module) {
  app.listen(PORT, () => console.log(`TaskTracker running on :${PORT}`));
}

module.exports = app;
