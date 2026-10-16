using Microsoft.EntityFrameworkCore;
using NYSCRadioTV.Domain.Entities;

namespace NYSCRadioTV.Infrastructure.Persistence;

public sealed class RadioTvDbContext(DbContextOptions<RadioTvDbContext> options) : DbContext(options)
{
    public DbSet<RadioChannel> RadioChannels => Set<RadioChannel>();
    public DbSet<TvChannel> TvChannels => Set<TvChannel>();
    public DbSet<ProgramSchedule> ProgramSchedules => Set<ProgramSchedule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RadioChannel>(entity =>
        {
            entity.HasKey(channel => channel.Id);
            entity.Property(channel => channel.Name).HasMaxLength(200).IsRequired();
            entity.Property(channel => channel.Description).HasMaxLength(2000);
            ConfigureMediaFields(entity);
        });

        modelBuilder.Entity<TvChannel>(entity =>
        {
            entity.HasKey(channel => channel.Id);
            entity.Property(channel => channel.Name).HasMaxLength(200).IsRequired();
            entity.Property(channel => channel.Description).HasMaxLength(2000);
            ConfigureMediaFields(entity);
        });

        modelBuilder.Entity<ProgramSchedule>(entity =>
        {
            entity.HasKey(item => item.Id);
            entity.Property(item => item.ProgramTitle).HasMaxLength(200).IsRequired();
            entity.Property(item => item.Description).HasMaxLength(2000);
            entity.HasIndex(item => new { item.ChannelId, item.StartTime });
            entity.Property(item => item.StartTime).HasConversion(
                value => value.ToUniversalTime().ToString("O"),
                value => DateTimeOffset.Parse(value, System.Globalization.CultureInfo.InvariantCulture));
            entity.Property(item => item.EndTime).HasConversion(
                value => value.ToUniversalTime().ToString("O"),
                value => DateTimeOffset.Parse(value, System.Globalization.CultureInfo.InvariantCulture));
        });
    }

    private static void ConfigureMediaFields<TEntity>(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<TEntity> entity)
        where TEntity : class
    {
        entity.Property("Logo").HasMaxLength(2048);
        entity.Property("StreamingUrl").HasMaxLength(2048);
        entity.Property("AudioUrl").HasMaxLength(2048);
        entity.Property("VideoUrl").HasMaxLength(2048);
        entity.Property("ThumbnailUrl").HasMaxLength(2048);
    }
}
