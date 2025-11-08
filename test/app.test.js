// test/app.test.js
// Force in-memory DB for isolation in tests
process.env.DB_PATH = ":memory:";

const request = require("supertest");
const app = require("../app");

describe("TaskTracker API (SQLite)", () => {
  it("GET /health -> 200 ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("POST /tasks -> creates, then GET lists it", async () => {
    const created = await request(app).post("/tasks").send({ title: "Write tests", description: "API" });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ title: "Write tests", description: "API" });

    const list = await request(app).get("/tasks");
    expect(list.status).toBe(200);
    expect(list.body.some(t => t.title === "Write tests")).toBe(true);
  });

  it("POST /tasks duplicate title -> 409", async () => {
    await request(app).post("/tasks").send({ title: "dup" });
    const dup = await request(app).post("/tasks").send({ title: "dup" });
    expect(dup.status).toBe(409);
  });

  it("DELETE /tasks/:id -> removes task", async () => {
    const c = await request(app).post("/tasks").send({ title: "to delete" });
    const id = c.body.id;
    const del = await request(app).delete(`/tasks/${id}`);
    expect(del.status).toBe(200);
    const list = await request(app).get("/tasks");
    expect(list.body.find(t => t.id === id)).toBeUndefined();
  });
});
