using Common.Base;

namespace Models.Response
{
    public class SuccessDto 
    {
        public SuccessDto() {

            Message = "Success";
        }

        public string Message { get; set; }
    }
}
