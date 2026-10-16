namespace NYSCRadioTV.Application.DTOs;

public sealed record ChannelDto(
    Guid Id,
    string Slug,
    string Name,
    string Type,
    string? Description,
    string? LogoUrl,
    string HlsUrl,
    string? AudioUrl,
    bool IsLive,
    string? VideoUrl = null,
    string? ThumbnailUrl = null);
