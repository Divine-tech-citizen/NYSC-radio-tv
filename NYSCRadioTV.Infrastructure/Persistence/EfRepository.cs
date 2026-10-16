using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using NYSCRadioTV.Application.Abstractions;
using NYSCRadioTV.Domain.Entities;

namespace NYSCRadioTV.Infrastructure.Persistence;

public sealed class EfRepository<T>(RadioTvDbContext dbContext) : IRepository<T>
    where T : class, IEntity
{
    public async Task<IReadOnlyList<T>> ListAsync(CancellationToken cancellationToken = default) =>
        await dbContext.Set<T>().AsNoTracking().ToArrayAsync(cancellationToken);

    public async Task<IReadOnlyList<T>> ListAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default) =>
        await dbContext.Set<T>().AsNoTracking().Where(predicate).ToArrayAsync(cancellationToken);

    public Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Set<T>().AsNoTracking().FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);

    public async Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        dbContext.Set<T>().Update(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
