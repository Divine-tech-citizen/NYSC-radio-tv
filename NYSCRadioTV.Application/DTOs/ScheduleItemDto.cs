namespace NYSCRadioTV.Application.DTOs;

public sealed record ScheduleItemDto(
    Guid Id,
    Guid ChannelId,
    string Title,
    string? Description,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    string? PreviewImageUrl = null,
    string? PreviewAudioUrl = null,
    string? PreviewVideoUrl = null);
