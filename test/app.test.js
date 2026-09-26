const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { app, tasks } = require("../app");

let server;
let base;

beforeEach(() => {
  tasks.length = 0;
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

test.afterEach(() => {
  server.close();
});

test("health route returns ok", async () => {
  const response = await fetch(`${base}/health`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.status, "ok");
});

test("valid task is created", async () => {
  const response = await fetch(`${base}/tasks`, {
    method: "POST",
    body: new URLSearchParams({
      title: "Finish CCA 2",
      description: "Complete the CI/CD project"
    }),
    redirect: "manual"
  });

  assert.equal(response.status, 302);

  const apiResponse = await fetch(`${base}/api/tasks`);
  const data = await apiResponse.json();

  assert.equal(data.length, 1);
  assert.equal(data[0].title, "Finish CCA 2");
  assert.equal(data[0].status, "Pending");
});

test("invalid task is rejected", async () => {
  const response = await fetch(`${base}/tasks`, {
    method: "POST",
    body: new URLSearchParams({ title: "" })
  });

  assert.equal(response.status, 400);
});

test("task status can be updated", async () => {
  await fetch(`${base}/tasks`, {
    method: "POST",
    body: new URLSearchParams({ title: "Test status" }),
    redirect: "manual"
  });

  const response = await fetch(`${base}/tasks/1/status`, {
    method: "POST",
    body: new URLSearchParams({ status: "Completed" }),
    redirect: "manual"
  });

  assert.equal(response.status, 302);
  assert.equal(tasks[0].status, "Completed");
});
