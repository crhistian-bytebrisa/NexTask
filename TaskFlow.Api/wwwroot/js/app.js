// TaskFlow - lógica del frontend

const API_URL = "/api/tasks";

const form = document.getElementById("task-form");
const messageEl = document.getElementById("form-message");

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
  } catch (error) {
    console.error(error);
    showMessage("Ocurrió un error al crear la tarea.", "error");
  }
});

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `form-message ${type}`;
}
