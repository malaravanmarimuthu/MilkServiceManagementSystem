using Common.BaseEntity;
using System.Linq.Expressions;

namespace Data.Base;

public interface IRepositary<T> where T : class
{
    ValueTask CreateAsync(T entity);

    ValueTask UpdateAsync(T entity);

    ValueTask DeleteAsync(T entity);

    IQueryable<T> FindAll();

    IQueryable<T> FindByCondition(Expression<Func<T, bool>> expression);

    IQueryable<T> FindByCondition(Expression<Func<T, bool>> expression, Expression<Func<T, dynamic>> orderBySelector, int skip, int take, bool isAscending);

    ValueTask<bool> IsAnyAsync(Expression<Func<T, bool>> expression);

    ValueTask<bool> IsAnyAsync<TEntity>(Expression<Func<TEntity, bool>> expression) where TEntity : BaseEntityModel;

    IQueryable<TEntity> Entity<TEntity>() where TEntity : class, new();

}
