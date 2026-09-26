# TaskFlow – Task Management Web App

A dynamic task management web application created for CCA 2 – Cloud Computing and DevOps.

## Features

- Add tasks with title and description
- View tasks dynamically from server data
- Update task status: Pending, In Progress, Completed
- Delete tasks
- Filter tasks by status
- JSON API at `/api/tasks`
- Health check at `/health`
- Running Git commit ID shown in the footer
- Automated tests and ESLint
- Docker container
- GitHub Actions CI/CD
- Render deployment through a deploy hook

## Tech Stack

- Node.js 22
- Express 5
- Node built-in test runner
- ESLint
- Docker
- GitHub Actions
- Render

## Run locally

```bash
npm install
npm run lint
npm test
npm start
```

Open http://localhost:3000

## Docker

```bash
docker build --build-arg GIT_SHA=local -t task-management-app .
docker run -p 3000:3000 task-management-app
```

## CI/CD flow

```text
Git push / Pull Request
        |
        v
   Install packages
        |
        v
       Lint
        |
        v
       Test
        |
        v
   Docker Build
        |
        v
   Health Check
        |
        v
 Deploy to Render
        |
        v
    Live Website
```

## Required Git workflow

Use meaningful commits and feature branches. Example:

```bash
git checkout -b feature/task-status
git add .
git commit -m "feat: add task status update"
git push -u origin feature/task-status
```

Then create a Pull Request on GitHub, wait for the CI checks, and merge it into `main`.

## Render setup

1. Create a Render Web Service connected to this GitHub repository.
2. Choose Docker as the environment.
3. Set the health check path to `/health`.
4. Turn Auto-Deploy OFF because GitHub Actions will trigger deployment.
5. Create a Render Deploy Hook.
6. Add the hook as a GitHub Actions secret named `RENDER_DEPLOY_HOOK`.
7. Push to `main`.

Render provides `RENDER_GIT_COMMIT`, which the application displays in the footer.

## CCA 2 evidence

Capture:
- Public GitHub repository
- At least 10 meaningful commits
- One merged Pull Request
- Successful GitHub Actions run
- Failed pipeline where deployment is skipped
- Live site showing the commit ID
- README and 4–6 page report
