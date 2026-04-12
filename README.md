# TaskFlow Pro — Sample Application Repo

> **QA Automation POC** · App Repository

This is the **application repository** half of the Cross-Repository CI/CD Triggered Automation POC .  
It contains a lightweight, fully self-contained task-management web app that serves as the System Under Test (SUT).

---

## What's Inside

```
app-repo/
├── src/
│   ├── index.html          ← Single-page task manager (the SUT)
│   ├── css/styles.css      ← Styling
│   └── js/app.js           ← In-memory CRUD logic
└── .github/
    └── workflows/
        └── deploy-and-trigger-automation.yml   ← Build → Deploy → Dispatch
```

---

## The App: TaskFlow Pro

A realistic-looking (but fully static) team task manager with:

| Region | What Selenium tests validate |
|--------|------------------------------|
| **Header** | Logo, nav links, logged-in user display |
| **Stats Strip** | 4 KPI counters: Total, In Progress, Completed, Overdue |
| **Add Task Form** | Title, Assignee, Priority, Due Date, success/error messages |
| **Task Board** | Filtering, search, toggle complete, delete |
| **Activity Feed** | Pre-seeded recent activity items |

---

## CI/CD Flow

```
Developer pushes to main/develop
          │
          ▼
┌─────────────────────────┐
│  GitHub Actions (app)   │
│  1. Lint / Build        │
│  2. Deploy to GH Pages  │
│  3. POST repository_    │
│     dispatch ──────────►│ automation-repo
└─────────────────────────┘  (see that repo's README)
```

### Dispatch Payload Sent

```json
{
  "env":           "staging",
  "app_url":       "https://your-org.github.io/taskflow-app/",
  "browser":       "chrome",
  "build_number":  "42",
  "triggered_by":  "srinivas-r",
  "commit_sha":    "abc1234...",
  "branch":        "main"
}
```

---

## Secrets Required (set in this repo)

| Secret Name | Description |
|-------------|-------------|
| `AUTOMATION_TRIGGER_TOKEN` | GitHub Personal Access Token with **repo** scope on the automation repo |
| `AUTOMATION_REPO` | `owner/repo-name` of the automation repo, e.g. `myorg/taskflow-automation` |

### How to Create the PAT

1. Go to **GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)**
2. Click **Generate new token (classic)**
3. Give it a name: `automation-trigger-poc`
4. Select scope: ✅ **repo** (full control of private repositories)
5. Set expiry: 90 days (or as per your org policy)
6. Copy the token value immediately (shown only once)
7. Add it to **this repo's** Secrets as `AUTOMATION_TRIGGER_TOKEN`
8. Add the automation repo path as `AUTOMATION_REPO` (e.g. `myorg/taskflow-automation`)

---

## Running Locally

Just open the HTML file directly:

```bash
# Option 1: Direct browser open
open src/index.html

# Option 2: Simple HTTP server (recommended — avoids CORS for local Selenium)
cd src
python3 -m http.server 8080
# Then open http://localhost:8080

# Option 3: Node.js serve
npx serve src -p 8080
```

---

## Triggering the Automation Manually

You can also trigger the automation workflow directly from GitHub's UI:

1. Go to **Actions** → **Build, Deploy & Trigger Automation**
2. Click **Run workflow**
3. Choose `environment` and `browser`
4. Click **Run workflow**

---

## Deploying to GitHub Pages

1. In the repo settings → **Pages** → Source: **GitHub Actions**
2. Push to `main` → the workflow deploys automatically
3. Your app URL will be `https://<owner>.github.io/<repo>/`
4. Set this URL as `AUTOMATION_REPO` secret value in the automation repo
