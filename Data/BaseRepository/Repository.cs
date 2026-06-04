using Common.BaseEntity;
using Data.Context;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Linq.Expressions;

namespace Data.Base;

public class Repository<T>(AuthDbContext context) : IRepositary<T> where T : class
{
    public readonly AuthDbContext _context = context;

    public virtual async ValueTask CreateAsync(T entity)
    {
        _context.Set<T>().Add(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async ValueTask DeleteAsync(T entity)
    {
        _context.Set<T>().Remove(entity);
        await _context.SaveChangesAsync();
    }

    public virtual IQueryable<T> FindAll()
    {
        return _context.Set<T>().AsNoTracking();
    }

    public virtual IQueryable<T> FindByCondition(Expression<Func<T, bool>> expression)
    {
        return _context.Set<T>().Where(expression).AsNoTracking();
    }

    public virtual IQueryable<T> FindByCondition(Expression<Func<T, bool>> expression, Expression<Func<T, dynamic>> orderBySelector, int skip, int take, bool isAscending)
    {
        if (isAscending)
            return _context.Set<T>().Where(expression).AsNoTracking()
                .OrderBy(orderBySelector)
                .Skip(skip)
                .Take(take);

        return _context.Set<T>().Where(expression).AsNoTracking()
              .OrderByDescending(orderBySelector)
              .Skip(skip)
              .Take(take);
    }

    public virtual async ValueTask<bool> IsAnyAsync(Expression<Func<T, bool>> expression)
    {
        return await _context.Set<T>().AsNoTracking().AnyAsync(expression);
    }

    public virtual async ValueTask UpdateAsync(T entity)
    {
        _context.Set<T>().Update(entity);
        await _context.SaveChangesAsync();
    }


    public virtual async ValueTask<bool> IsAnyAsync<TEntity>(Expression<Func<TEntity, bool>> expression) where TEntity : BaseEntityModel
    {
        return await _context.Set<TEntity>().AsNoTracking().AnyAsync(expression);
    }

    public virtual IQueryable<TEntity> Entity<TEntity>() where TEntity :class, new()
    {
        return _context.Set<TEntity>().AsNoTracking();
    }
}
