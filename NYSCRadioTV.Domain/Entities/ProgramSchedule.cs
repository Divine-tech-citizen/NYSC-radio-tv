namespace NYSCRadioTV.Domain.Entities;

public sealed class ProgramSchedule : IEntity
{
    public Guid Id { get; set; }
    public Guid ChannelId { get; set; }
    public string ProgramTitle { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
    public string? PreviewImageUrl { get; set; }
    public string? PreviewAudioUrl { get; set; }
    public string? PreviewVideoUrl { get; set; }
}
