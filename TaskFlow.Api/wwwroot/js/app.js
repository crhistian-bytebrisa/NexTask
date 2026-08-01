// TaskFlow - lógica del frontend

const API_URL = "/api/tasks";

const form = document.getElementById("task-form");
const messageEl = document.getElementById("form-message");
const listEl = document.getElementById("task-list");
const emptyMessageEl = document.getElementById("empty-message");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!title) {
        showMessage("El título es obligatorio.", "error");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description: description || null }),
        });

        if (!response.ok) {
            throw new Error("No se pudo crear la tarea.");
        }

        form.reset();
        showMessage("Tarea creada correctamente.", "success");
        await loadTasks();
    } catch (error) {
        console.error(error);
        showMessage("Ocurrió un error al crear la tarea.", "error");
    }
});

async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("No se pudieron cargar las tareas.");
        }
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error(error);
    }
}

function renderTasks(tasks) {
    listEl.innerHTML = "";

    if (tasks.length === 0) {
        emptyMessageEl.hidden = false;
        return;
    }
    emptyMessageEl.hidden = true;

    for (const task of tasks) {
        const li = document.createElement("li");
        li.className = `task-item ${task.isCompleted ? "completed" : ""}`;

        const titleEl = document.createElement("span");
        titleEl.className = "task-title";
        titleEl.textContent = task.title;

        li.appendChild(titleEl);

        if (task.description) {
            const descEl = document.createElement("p");
            descEl.className = "task-description";
            descEl.textContent = task.description;
            li.appendChild(descEl);
        }

        const statusEl = document.createElement("span");
        statusEl.className = "task-status";
        statusEl.textContent = task.isCompleted ? "Completada" : "Pendiente";
        li.appendChild(statusEl);

        listEl.appendChild(li);
    }
}

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `form-message ${type}`;
}

loadTasks();
