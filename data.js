import Database from "better-sqlite3";
const DB_PATH = process.env.DB_PATH || "./app.db";

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT ''
  );
`);

export function listTasks() {
  return db.prepare("SELECT id, title, description FROM tasks ORDER BY id DESC").all();
}
export function createTask(title, description = "") {
  const info = db.prepare("INSERT INTO tasks (title, description) VALUES (?, ?)").run(title, description);
  return db.prepare("SELECT id, title, description FROM tasks WHERE id=?").get(info.lastInsertRowid);
}
export function deleteTask(id) {
  return db.prepare("DELETE FROM tasks WHERE id=?").run(id).changes > 0;
}
