using System.Linq.Expressions;
using NYSCRadioTV.Domain.Entities;

namespace NYSCRadioTV.Application.Abstractions;

public interface IRepository<T> where T : class, IEntity
{
    Task<IReadOnlyList<T>> ListAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> ListAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
}
