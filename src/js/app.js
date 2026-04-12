/**
 * TaskFlow Pro – app.js
 * Sample application for QA Automation POC
 *
 * Provides: task CRUD, filtering, search, stats updates.
 * All data is in-memory (no backend) so the page is fully self-contained
 * and easy to host as a static site (GitHub Pages, S3, Nginx, etc.)
 */

(function () {
  "use strict";

  /* ============================================================
     DATA STORE
     ============================================================ */
  const tasks = [
    { id: 1, title: "Fix login page validation bug",      assignee: "Srinivas R.", priority: "critical", due: "2025-07-10", status: "in-progress" },
    { id: 2, title: "Write unit tests for auth module",   assignee: "Srinivas R.", priority: "high",     due: "2025-07-12", status: "completed"  },
    { id: 3, title: "Design new dashboard layout",        assignee: "Priya K.",    priority: "medium",   due: "2025-07-15", status: "in-progress" },
    { id: 4, title: "API rate limiting implementation",   assignee: "Rahul M.",    priority: "critical", due: "2025-06-30", status: "overdue"     },
    { id: 5, title: "Set up CI/CD pipeline for QA repo",  assignee: "Srinivas R.", priority: "high",     due: "2025-07-08", status: "completed"  },
    { id: 6, title: "Update patient data export module",  assignee: "Priya K.",    priority: "medium",   due: "2025-07-20", status: "in-progress" },
    { id: 7, title: "Code review for prescription flow",  assignee: "Rahul M.",    priority: "low",      due: "2025-07-18", status: "in-progress" },
    { id: 8, title: "Database index optimisation",        assignee: "Ankit S.",    priority: "medium",   due: "2025-06-28", status: "overdue"     },
    { id: 9, title: "Accessibility audit – WCAG 2.1",     assignee: "Priya K.",    priority: "high",     due: "2025-07-22", status: "in-progress" },
    { id: 10,"title": "Migrate env configs to Vault",     assignee: "Ankit S.",    priority: "medium",   due: "2025-07-25", status: "completed"  },
    { id: 11,"title": "Document REST API endpoints",      assignee: "Rahul M.",    priority: "low",      due: "2025-07-30", status: "completed"  },
    { id: 12,"title": "Performance testing – patient search", assignee: "Srinivas R.", priority: "high", due: "2025-07-14", status: "completed"  },
  ];

  let nextId = tasks.length + 1;
  let activeFilter = "all";
  let searchTerm   = "";

  /* ============================================================
     HELPERS
     ============================================================ */

  /** Return badge class based on priority string */
  function badgeClass(priority) {
    const map = { low: "badge-low", medium: "badge-medium", high: "badge-high", critical: "badge-critical" };
    return map[priority] || "badge-medium";
  }

  /** Format an ISO date string as dd/mm/yyyy */
  function fmtDate(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  /* ============================================================
     STATS UPDATE
     ============================================================ */
  function updateStats() {
    document.getElementById("stat-total-count").textContent     = tasks.length;
    document.getElementById("stat-active-count").textContent    = tasks.filter(t => t.status === "in-progress").length;
    document.getElementById("stat-completed-count").textContent = tasks.filter(t => t.status === "completed").length;
    document.getElementById("stat-overdue-count").textContent   = tasks.filter(t => t.status === "overdue").length;
  }

  /* ============================================================
     RENDER TASKS
     ============================================================ */
  function renderTasks() {
    const container  = document.getElementById("task-list");
    const emptyState = document.getElementById("empty-state");
    container.innerHTML = "";

    const filtered = tasks.filter(task => {
      const matchesFilter =
        activeFilter === "all"         ? true :
        activeFilter === "in-progress" ? task.status === "in-progress" :
        activeFilter === "completed"   ? task.status === "completed"   :
        activeFilter === "overdue"     ? task.status === "overdue"     : true;

      const matchesSearch = !searchTerm ||
        task.title.toLowerCase().includes(searchTerm) ||
        task.assignee.toLowerCase().includes(searchTerm);

      return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }
    emptyState.classList.add("hidden");

    filtered.forEach(task => {
      const isCompleted = task.status === "completed";

      const item = document.createElement("div");
      item.className   = "task-item";
      item.id          = `task-item-${task.id}`;
      item.dataset.id  = task.id;

      item.innerHTML = `
        <div
          class="task-checkbox ${isCompleted ? "checked" : ""}"
          id="task-check-${task.id}"
          data-task-id="${task.id}"
          title="Toggle complete"
          role="checkbox"
          aria-checked="${isCompleted}"
          tabindex="0"
        >${isCompleted ? "✓" : ""}</div>

        <div class="task-body">
          <div
            class="task-title-text ${isCompleted ? "completed-text" : ""}"
            id="task-title-text-${task.id}"
          >${task.title}</div>
          <div class="task-meta" id="task-meta-${task.id}">
            Assignee: <strong>${task.assignee}</strong> &nbsp;|&nbsp; Due: ${fmtDate(task.due)} &nbsp;|&nbsp; Status: ${task.status}
          </div>
        </div>

        <span
          class="badge ${badgeClass(task.priority)}"
          id="task-priority-badge-${task.id}"
        >${task.priority}</span>

        <button
          class="btn-delete"
          id="btn-delete-${task.id}"
          data-task-id="${task.id}"
          title="Delete task"
          aria-label="Delete task: ${task.title}"
        >🗑</button>
      `;

      container.appendChild(item);
    });

    /* bind events after render */
    container.querySelectorAll(".task-checkbox").forEach(el => {
      el.addEventListener("click",   () => toggleTask(+el.dataset.taskId));
      el.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter") toggleTask(+el.dataset.taskId); });
    });
    container.querySelectorAll(".btn-delete").forEach(el => {
      el.addEventListener("click", () => deleteTask(+el.dataset.taskId));
    });
  }

  /* ============================================================
     ACTIONS
     ============================================================ */

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.status = task.status === "completed" ? "in-progress" : "completed";
    renderTasks();
    updateStats();
  }

  function deleteTask(id) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    tasks.splice(idx, 1);
    renderTasks();
    updateStats();
  }

  function addTask() {
    const titleEl    = document.getElementById("task-title");
    const assigneeEl = document.getElementById("task-assignee");
    const priorityEl = document.getElementById("task-priority");
    const dueDateEl  = document.getElementById("task-due-date");
    const msgEl      = document.getElementById("form-message");

    const title = titleEl.value.trim();

    /* Validation */
    if (!title) {
      showMessage(msgEl, "error", "⚠ Task Title is required.");
      titleEl.focus();
      return;
    }

    const newTask = {
      id:       nextId++,
      title,
      assignee: assigneeEl.value.trim() || "Unassigned",
      priority: priorityEl.value || "medium",
      due:      dueDateEl.value  || "",
      status:   "in-progress",
    };

    tasks.unshift(newTask);

    /* Reset form */
    titleEl.value    = "";
    assigneeEl.value = "";
    priorityEl.value = "medium";
    dueDateEl.value  = "";

    showMessage(msgEl, "success", `✅ Task "${newTask.title}" added successfully!`);

    renderTasks();
    updateStats();
  }

  function clearForm() {
    document.getElementById("task-title").value       = "";
    document.getElementById("task-assignee").value    = "";
    document.getElementById("task-priority").value    = "medium";
    document.getElementById("task-due-date").value    = "";
    document.getElementById("task-description").value = "";
    const msgEl = document.getElementById("form-message");
    msgEl.classList.add("hidden");
  }

  function showMessage(el, type, text) {
    el.className    = `form-message ${type}`;
    el.textContent  = text;
    el.classList.remove("hidden");
    /* auto-hide after 4s */
    setTimeout(() => el.classList.add("hidden"), 4000);
  }

  /* ============================================================
     SEARCH & FILTER EVENTS
     ============================================================ */
  document.getElementById("search-input").addEventListener("input", function () {
    searchTerm = this.value.trim().toLowerCase();
    renderTasks();
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      activeFilter = this.dataset.filter;
      renderTasks();
    });
  });

  document.getElementById("btn-add-task").addEventListener("click", addTask);
  document.getElementById("btn-clear-form").addEventListener("click", clearForm);

  /* Allow Enter key in title field to submit */
  document.getElementById("task-title").addEventListener("keydown", function (e) {
    if (e.key === "Enter") addTask();
  });

  /* ============================================================
     INIT
     ============================================================ */
  updateStats();
  renderTasks();

})();
