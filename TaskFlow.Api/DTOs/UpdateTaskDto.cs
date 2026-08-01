using System.ComponentModel.DataAnnotations;

namespace TaskFlow.Api.DTOs
{
    public class UpdateTaskDto
    {
        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public bool IsCompleted { get; set; }
    }
}
