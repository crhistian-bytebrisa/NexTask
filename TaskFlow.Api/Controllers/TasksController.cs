using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Data;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Models;

namespace TaskFlow.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly TaskFlowDbContext _context;

    public TasksController(TaskFlowDbContext context)
    {
        _context = context;
    }

    // GET: api/tasks
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasks()
    {
        var tasks = await _context.Tasks
            .OrderBy(t => t.IsCompleted)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tasks.Select(ToDto));
    }

    // POST: api/tasks
    [HttpPost]
    public async Task<ActionResult<TaskDto>> CreateTask([FromBody] CreateTaskDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var task = new TaskItem
        {
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        var result = ToDto(task);
        return CreatedAtAction(nameof(CreateTask), new { id = task.Id }, result);
    }

    // PUT: api/tasks/{id}
    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskDto>> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var task = await _context.Tasks.FindAsync(id);
        if (task is null)
        {
            return NotFound(new { message = $"No se encontró la tarea con id {id}." });
        }

        task.Title = dto.Title.Trim();
        task.Description = dto.Description?.Trim();
        task.IsCompleted = dto.IsCompleted;

        await _context.SaveChangesAsync();

        return Ok(ToDto(task));
    }
    private static TaskDto ToDto(TaskItem task) => new()
    {
        Id = task.Id,
        Title = task.Title,
        Description = task.Description,
        IsCompleted = task.IsCompleted,
        CreatedAt = task.CreatedAt
    };
}
