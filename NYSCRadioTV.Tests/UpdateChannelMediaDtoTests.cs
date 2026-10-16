using System.ComponentModel.DataAnnotations;
using NYSCRadioTV.Application.DTOs;

namespace NYSCRadioTV.Tests;

public sealed class UpdateChannelMediaDtoTests
{
    [Theory]
    [InlineData("https://cdn.example.com/live/playlist.m3u8")]
    [InlineData("/media/poster.png")]
    public void Validate_AcceptsHttpAndLocalMediaUrls(string url)
    {
        var dto = new UpdateChannelMediaDto { VideoUrl = url };
        var results = new List<ValidationResult>();

        var valid = Validator.TryValidateObject(dto, new ValidationContext(dto), results, validateAllProperties: true);

        Assert.True(valid);
        Assert.Empty(results);
    }

    [Fact]
    public void Validate_RejectsNonHttpSchemes()
    {
        var dto = new UpdateChannelMediaDto { VideoUrl = "javascript:alert(1)" };
        var results = new List<ValidationResult>();

        var valid = Validator.TryValidateObject(dto, new ValidationContext(dto), results, validateAllProperties: true);

        Assert.False(valid);
        Assert.Contains(results, result => result.MemberNames.Contains(nameof(UpdateChannelMediaDto.VideoUrl)));
    }

    [Fact]
    public void Validate_RejectsOverlongUrls()
    {
        var dto = new UpdateChannelMediaDto { LogoUrl = $"https://cdn.example.com/{new string('a', 2048)}" };
        var results = new List<ValidationResult>();

        var valid = Validator.TryValidateObject(dto, new ValidationContext(dto), results, validateAllProperties: true);

        Assert.False(valid);
        Assert.Contains(results, result => result.MemberNames.Contains(nameof(UpdateChannelMediaDto.LogoUrl)));
    }
}
