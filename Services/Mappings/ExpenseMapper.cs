using Mapster;
using Models.Dto;

namespace Services.Mappings
{
    internal class ExpenseMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Data.Entities.Expense, ExpenseDto>()
                .Map(dest => dest.ExpenseDate, src => src.ExpenseDate.ToString("dd-MM-yyyy"));

            config.NewConfig<CreateExpenseRequest, Data.Entities.Expense>()
                .Ignore(dest => dest.ExpenseID)
                .Ignore(dest => dest.ExpenseDate)   
                .Ignore(dest => dest.CreatedDate);

            config.NewConfig<List<Data.Entities.Expense>, List<ExpenseDto>>();
        }
    }
}