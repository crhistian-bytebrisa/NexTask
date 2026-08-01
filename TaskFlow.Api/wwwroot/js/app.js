// TaskFlow - lógica del frontend

const API_URL = "/api/tasks";

const form = document.getElementById("task-form");
const messageEl = document.getElementById("form-message");
const listEl = document.getElementById("task-list");
const emptyMessageEl = document.getElementById("empty-message");
const loadingEl = document.getElementById("loading-message");

let editingTaskId = null;

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!title) {
        showMessage("El título es obligatorio.", "error");
        return;
    }

    try {
        if (editingTaskId) {
            await updateTask(editingTaskId, { title, description: description || null, isCompleted: false }, true);
            showMessage("Tarea actualizada correctamente.", "success");
        } else {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description: description || null }),
            });

            if (!response.ok) {
                throw new Error("No se pudo crear la tarea.");
            }

            showMessage("Tarea creada correctamente.", "success");
        }

        form.reset();
        editingTaskId = null;
        resetSubmitButton();
        await loadTasks();
    } catch (error) {
        console.error(error);
        showMessage("Ocurrió un error al guardar la tarea. Intenta de nuevo.", "error");
    }
});

async function loadTasks() {
    toggleLoading(true);
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("No se pudieron cargar las tareas.");
        }
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error(error);
        showMessage("No se pudieron cargar las tareas. Verifica tu conexión.", "error");
    } finally {
        toggleLoading(false);
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
        listEl.appendChild(buildTaskElement(task));
    }
}

function buildTaskElement(task) {
    const li = document.createElement("li");
    li.className = `task-item ${task.isCompleted ? "completed" : ""}`;

    const topRow = document.createElement("div");
    topRow.className = "task-top-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.isCompleted;
    checkbox.addEventListener("change", async () => {
        try {
            await updateTask(task.id, {
                title: task.title,
                description: task.description,
                isCompleted: checkbox.checked,
            });
        } catch (error) {
            console.error(error);
            checkbox.checked = !checkbox.checked;
            showMessage("No se pudo actualizar el estado de la tarea.", "error");
        }
    });

    const titleEl = document.createElement("span");
    titleEl.className = "task-title";
    titleEl.textContent = task.title;

    topRow.appendChild(checkbox);
    topRow.appendChild(titleEl);
    li.appendChild(topRow);

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

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-secondary";
    editBtn.textContent = "Editar";
    editBtn.addEventListener("click", () => startEdit(task));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-danger";
    deleteBtn.textContent = "Eliminar";
    deleteBtn.addEventListener("click", () => confirmDelete(task));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(actions);

    return li;
}

async function updateTask(id, payload, silent = false) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("No se pudo actualizar la tarea.");
    }

    if (!silent) {
        await loadTasks();
    }
}

function confirmDelete(task) {
    const confirmed = window.confirm(`¿Eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`);
    if (confirmed) {
        deleteTask(task.id);
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) {
            throw new Error("No se pudo eliminar la tarea.");
        }
        showMessage("Tarea eliminada.", "success");
        await loadTasks();
    } catch (error) {
        console.error(error);
        showMessage("No se pudo eliminar la tarea. Intenta de nuevo.", "error");
    }
}

function startEdit(task) {
    editingTaskId = task.id;
    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description ?? "";

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.textContent = "Guardar cambios";
    showMessage(`Editando: "${task.title}"`, "success");
    document.getElementById("title").focus();
}

function resetSubmitButton() {
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.textContent = "Agregar tarea";
}

function toggleLoading(isLoading) {
    loadingEl.hidden = !isLoading;
}

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `form-message ${type}`;
}

loadTasks();
