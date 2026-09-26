// task validation middleware and routes
const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const tasks = [];
let nextId = 1;

const esc = (value) => String(value).replace(/[&<>"']/g, (char) => {
  const entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  return entities[char];
});

const commit = (process.env.RENDER_GIT_COMMIT || process.env.GIT_SHA || "local")
  .slice(0, 7);

const validStatus = (status) => ["Pending", "In Progress", "Completed"].includes(status);

function renderPage(filter = "All") {
  const visibleTasks = filter === "All"
    ? tasks
    : tasks.filter((task) => task.status === filter);

  const cards = visibleTasks.length
    ? visibleTasks.map((task) => `
      <article class="task-card ${task.status === "Completed" ? "done" : ""}">
        <div>
          <h3>${esc(task.title)}</h3>
          <p>${esc(task.description || "No description")}</p>
          <span class="badge">${esc(task.status)}</span>
        </div>
        <div class="actions">
          <form method="POST" action="/tasks/${task.id}/status">
            <select name="status" aria-label="Status for ${esc(task.title)}">
              ${["Pending", "In Progress", "Completed"].map((status) =>
                `<option ${status === task.status ? "selected" : ""}>${status}</option>`
              ).join("")}
            </select>
            <button type="submit">Update</button>
          </form>
          <form method="POST" action="/tasks/${task.id}/delete">
            <button class="danger" type="submit">Delete</button>
          </form>
        </div>
      </article>
    `).join("")
    : `<div class="empty">No tasks found for this filter.</div>`;

  const counts = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "Pending").length,
    progress: tasks.filter((task) => task.status === "In Progress").length,
    completed: tasks.filter((task) => task.status === "Completed").length
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TaskFlow - Task Management</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; background: #f4f7fb; color: #172033; }
    header { background: #172554; color: white; padding: 28px 20px; }
    .container { max-width: 1000px; margin: auto; }
    h1 { margin: 0 0 6px; }
    .subtitle { margin: 0; opacity: .85; }
    main { padding: 24px 20px 50px; }
    .panel { background: white; padding: 20px; border-radius: 14px; margin-bottom: 20px; box-shadow: 0 5px 18px rgba(0,0,0,.06); }
    .form-grid { display: grid; grid-template-columns: 1fr 1.5fr auto; gap: 10px; }
    input, select, button { padding: 11px 12px; border-radius: 8px; border: 1px solid #ccd4e0; font: inherit; }
    button { background: #2563eb; color: white; border: 0; cursor: pointer; font-weight: 600; }
    button:hover { opacity: .9; }
    .danger { background: #dc2626; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat { background: white; padding: 16px; border-radius: 12px; }
    .stat strong { display: block; font-size: 25px; margin-top: 5px; }
    .filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
    .filters a { text-decoration: none; color: #172033; background: #e7edf6; padding: 8px 12px; border-radius: 20px; }
    .filters a.active { background: #2563eb; color: white; }
    .task-card { display: flex; justify-content: space-between; gap: 20px; border: 1px solid #e1e7ef; border-radius: 12px; padding: 16px; margin: 10px 0; }
    .task-card.done h3 { text-decoration: line-through; opacity: .65; }
    .task-card h3 { margin: 0 0 7px; }
    .task-card p { margin: 0 0 10px; color: #596579; }
    .badge { display: inline-block; background: #e9eef7; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
    .actions { display: flex; gap: 8px; align-items: start; }
    .actions form { display: flex; gap: 6px; }
    .empty { text-align: center; padding: 30px; color: #667085; }
    footer { text-align: center; color: #667085; padding: 25px; font-size: 13px; }
    @media (max-width: 720px) {
      .form-grid, .stats { grid-template-columns: 1fr; }
      .task-card { flex-direction: column; }
      .actions { flex-wrap: wrap; }
    }
  </style>
</head>
<body>
<header>
  <div class="container">
    <h1>TaskFlow</h1>
    <p class="subtitle">Simple dynamic task management for CCA 2</p>
  </div>
</header>
<main class="container">
  <section class="panel">
    <h2>Add New Task</h2>
    <form class="form-grid" method="POST" action="/tasks">
      <input name="title" placeholder="Task title" maxlength="80" required>
      <input name="description" placeholder="Description (optional)" maxlength="200">
      <button type="submit">Add Task</button>
    </form>
  </section>

  <section class="stats">
    <div class="stat">Total<strong>${counts.total}</strong></div>
    <div class="stat">Pending<strong>${counts.pending}</strong></div>
    <div class="stat">In Progress<strong>${counts.progress}</strong></div>
    <div class="stat">Completed<strong>${counts.completed}</strong></div>
  </section>

  <section class="panel">
    <h2>Your Tasks</h2>
    <nav class="filters">
      ${["All", "Pending", "In Progress", "Completed"].map((item) =>
        `<a class="${filter === item ? "active" : ""}" href="/?filter=${encodeURIComponent(item)}">${item}</a>`
      ).join("")}
    </nav>
    ${cards}
  </section>
</main>
<footer>Running commit: ${esc(commit)}</footer>
</body>
</html>`;
}

app.get("/", (req, res) => {
  const filter = ["All", "Pending", "In Progress", "Completed"].includes(req.query.filter)
    ? req.query.filter
    : "All";
  res.send(renderPage(filter));
});

app.post("/tasks", (req, res) => {
  const title = String(req.body.title || "").trim();
  const description = String(req.body.description || "").trim();

  if (!title) {
    return res.status(400).send("Task title is required");
  }

  tasks.push({
    id: nextId++,
    title,
    description,
    status: "Pending"
  });

  return res.redirect("/");
});

app.post("/tasks/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((item) => item.id === id);

  if (!task || !validStatus(req.body.status)) {
    return res.status(400).send("Invalid task or status");
  }

  task.status = req.body.status;
  return res.redirect("/");
});

app.post("/tasks/:id/delete", (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).send("Task not found");
  }

  tasks.splice(index, 1);
  return res.redirect("/");
});

app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", commit });
});

function resetTasks() {
  tasks.length = 0;
  nextId = 1; 
}

module.exports = { app, tasks, resetTasks };
