using Microsoft.EntityFrameworkCore;
using NYSCRadioTV.Domain.Entities;

namespace NYSCRadioTV.Infrastructure.Persistence;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(RadioTvDbContext dbContext, CancellationToken cancellationToken = default)
    {
        await dbContext.Database.EnsureCreatedAsync(cancellationToken);

        if (!await dbContext.TvChannels.AnyAsync(cancellationToken))
        {
            dbContext.TvChannels.Add(new TvChannel
            {
                Id = Guid.Parse("11111111-1111-4111-8111-111111111111"),
                Name = "NYSC TV Preview",
                Description = "A youth-service feature from Channels Television. This is not a live NYSC broadcast.",
                Logo = "/media/nysc-tv-artwork.svg",
                VideoUrl = "https://www.youtube.com/watch?v=L5-YIWd4JWc",
                IsLive = false,
            });
        }

        if (!await dbContext.RadioChannels.AnyAsync(cancellationToken))
        {
            dbContext.RadioChannels.Add(new RadioChannel
            {
                Id = Guid.Parse("22222222-2222-4222-8222-222222222222"),
                Name = "NYSC Radio Preview",
                Description = "A short sample audio preview. Replace the URL with the station stream.",
                Logo = "/media/nysc-radio-artwork.svg",
                AudioUrl = "/media/nysc-radio-preview.wav",
                IsLive = false,
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
