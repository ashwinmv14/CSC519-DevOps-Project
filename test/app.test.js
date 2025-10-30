import request from "supertest";
import app from "../app.js";

describe("TaskTracker API", () => {
  it("health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("creates and lists a task", async () => {
    const create = await request(app).post("/tasks").query({ title: "DemoTask" });
    expect(create.statusCode).toBe(200);
    const list = await request(app).get("/tasks");
    expect(list.statusCode).toBe(200);
    expect(list.body.some(t => t.title === "DemoTask")).toBe(true);
  });
});
    