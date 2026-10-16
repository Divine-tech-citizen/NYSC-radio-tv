using System.ComponentModel.DataAnnotations;

namespace NYSCRadioTV.Application.DTOs;

public sealed class UpdateChannelMediaDto : IValidatableObject
{
    public string? LogoUrl { get; init; }
    public string? HlsUrl { get; init; }
    public string? AudioUrl { get; init; }
    public string? VideoUrl { get; init; }
    public string? ThumbnailUrl { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var values = new Dictionary<string, string?>
        {
            [nameof(LogoUrl)] = LogoUrl,
            [nameof(HlsUrl)] = HlsUrl,
            [nameof(AudioUrl)] = AudioUrl,
            [nameof(VideoUrl)] = VideoUrl,
            [nameof(ThumbnailUrl)] = ThumbnailUrl,
        };

        foreach (var (field, value) in values)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            var normalized = value.Trim();
            var isLocalMedia = normalized.StartsWith("/media/", StringComparison.Ordinal);
            var isWebUrl = Uri.TryCreate(normalized, UriKind.Absolute, out var uri)
                && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
            if (normalized.Length > 2048 || (!isLocalMedia && !isWebUrl))
            {
                yield return new ValidationResult(
                    $"{field} must be an HTTP(S) URL or a /media/ path no longer than 2048 characters.",
                    [field]);
            }
        }
    }
}
