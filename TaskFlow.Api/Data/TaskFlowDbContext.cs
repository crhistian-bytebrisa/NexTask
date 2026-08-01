using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Models;

namespace TaskFlow.Api.Data;

public class TaskFlowDbContext : DbContext
{
    public TaskFlowDbContext(DbContextOptions<TaskFlowDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }

    public DbSet<TaskItem> Tasks { get; set; }

}
