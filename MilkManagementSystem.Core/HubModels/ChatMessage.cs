
namespace api_truckcompanyservice.HubModels
{
    public class ChatMessage
    {
        public  string ChatRoomId { get; set; }
        public  string Sender { get; set; }
        public DateTime Date { get; set; }
        public string Message { get; set; }
        public string Role { get; set; }

    }

    public class TicketChatMessage : ChatMessage
    {
        public string ConversationId { get; set; }
    }
}
