using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NYSCRadioTV.Application.Abstractions;
using NYSCRadioTV.Application.DTOs;
using NYSCRadioTV.Domain.Entities;

namespace NYSCRadioTV.API.Controllers;

[ApiController]
[Route("api/channels")]
public sealed class ChannelsController(
    IRepository<RadioChannel> radioChannels,
    IRepository<TvChannel> tvChannels,
    IRepository<ProgramSchedule> schedules) : ControllerBase
{
    private static readonly TimeZoneInfo LagosTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Africa/Lagos");

    [HttpGet]
    [ProducesResponseType<IReadOnlyList<ChannelDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ChannelDto>>> GetChannels(CancellationToken cancellationToken)
    {
        var radio = await radioChannels.ListAsync(cancellationToken: cancellationToken);
        var television = await tvChannels.ListAsync(cancellationToken: cancellationToken);

        return Ok(radio.Select(channel => ToDto(channel))
            .Concat(television.Select(channel => ToDto(channel)))
            .OrderBy(channel => channel.Name)
            .ToArray());
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<ChannelDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChannelDto>> GetChannel(Guid id, CancellationToken cancellationToken)
    {
        var radio = await radioChannels.GetByIdAsync(id, cancellationToken);
        if (radio is not null)
        {
            return Ok(ToDto(radio));
        }

        var television = await tvChannels.GetByIdAsync(id, cancellationToken);
        return television is null ? NotFound() : Ok(ToDto(television));
    }

    [HttpGet("{id:guid}/schedule")]
    [ProducesResponseType<IReadOnlyList<ScheduleItemDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<ScheduleItemDto>>> GetSchedule(
        Guid id,
        [FromQuery] string? date,
        CancellationToken cancellationToken)
    {
        var channelExists = await radioChannels.GetByIdAsync(id, cancellationToken) is not null
            || await tvChannels.GetByIdAsync(id, cancellationToken) is not null;
        if (!channelExists)
        {
            return NotFound();
        }

        var requestedDate = DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, LagosTimeZone).DateTime);
        if (date is not null
            && !DateOnly.TryParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out requestedDate))
        {
            return BadRequest("The date query parameter must be an ISO date (yyyy-MM-dd).");
        }

        var localStart = DateTime.SpecifyKind(requestedDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Unspecified);
        var startUtc = TimeZoneInfo.ConvertTimeToUtc(localStart, LagosTimeZone);
        var start = new DateTimeOffset(startUtc, TimeSpan.Zero);
        var end = start.AddDays(1);
        var items = await schedules.ListAsync(
            item => item.ChannelId == id && item.StartTime >= start && item.StartTime < end,
            cancellationToken);

        return Ok(items.OrderBy(item => item.StartTime).Select(item => new ScheduleItemDto(
            item.Id,
            item.ChannelId,
            item.ProgramTitle,
            item.Description,
            item.StartTime,
            item.EndTime,
            item.PreviewImageUrl,
            item.PreviewAudioUrl,
            item.PreviewVideoUrl)).ToArray());
    }

    [HttpPut("{id:guid}/media")]
    [Authorize(Policy = "FirebaseAdmin")]
    [ProducesResponseType<ChannelDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChannelDto>> UpdateMedia(
        Guid id,
        UpdateChannelMediaDto media,
        CancellationToken cancellationToken)
    {
        var radio = await radioChannels.GetByIdAsync(id, cancellationToken);
        if (radio is not null)
        {
            ApplyMedia(radio, media);
            await radioChannels.UpdateAsync(radio, cancellationToken);
            return Ok(ToDto(radio));
        }

        var television = await tvChannels.GetByIdAsync(id, cancellationToken);
        if (television is null)
        {
            return NotFound();
        }

        ApplyMedia(television, media);
        await tvChannels.UpdateAsync(television, cancellationToken);
        return Ok(ToDto(television));
    }

    private static ChannelDto ToDto(RadioChannel channel) => new(
        channel.Id,
        CreateSlug(channel.Name),
        channel.Name,
        "radio",
        channel.Description,
        channel.Logo,
        channel.StreamingUrl ?? string.Empty,
        channel.AudioUrl ?? channel.StreamingUrl,
        channel.IsLive,
        channel.VideoUrl,
        channel.ThumbnailUrl);

    private static ChannelDto ToDto(TvChannel channel) => new(
        channel.Id,
        CreateSlug(channel.Name),
        channel.Name,
        "tv",
        channel.Description,
        channel.Logo,
        channel.StreamingUrl ?? string.Empty,
        channel.AudioUrl,
        channel.IsLive,
        channel.VideoUrl,
        channel.ThumbnailUrl);

    private static void ApplyMedia(RadioChannel channel, UpdateChannelMediaDto media)
    {
        channel.Logo = NormalizeUrl(media.LogoUrl);
        channel.StreamingUrl = NormalizeUrl(media.HlsUrl);
        channel.AudioUrl = NormalizeUrl(media.AudioUrl);
        channel.VideoUrl = NormalizeUrl(media.VideoUrl);
        channel.ThumbnailUrl = NormalizeUrl(media.ThumbnailUrl);
    }

    private static void ApplyMedia(TvChannel channel, UpdateChannelMediaDto media)
    {
        channel.Logo = NormalizeUrl(media.LogoUrl);
        channel.StreamingUrl = NormalizeUrl(media.HlsUrl);
        channel.AudioUrl = NormalizeUrl(media.AudioUrl);
        channel.VideoUrl = NormalizeUrl(media.VideoUrl);
        channel.ThumbnailUrl = NormalizeUrl(media.ThumbnailUrl);
    }

    private static string? NormalizeUrl(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string CreateSlug(string name) =>
        string.Join('-', name.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .ToLowerInvariant();
}
