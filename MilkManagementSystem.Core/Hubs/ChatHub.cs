using api_truckcompanyservice.HubDataService;
using api_truckcompanyservice.HubModels;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;
using Services.Contracts;
using System.Text.Json;

/*namespace api_truckcompanyservice.Hubs
{
    public class ChatHub : Hub
    {
        private readonly SharedDb _sharedDb;
        private readonly ITicketsConverationService _ticketConverationService;
        private readonly ITruckCallConversationService _truckCallConverationService;
        public ChatHub(SharedDb sharedDb, 
            ITicketsConverationService ticketConverationService,
            ITruckCallConversationService truckCallConverationService)
        {
            _sharedDb = sharedDb;
            _ticketConverationService = ticketConverationService;
            _truckCallConverationService = truckCallConverationService;
        }

        public async Task JoinChat(UserConnection connection)
        {
            await Clients.All
                .SendAsync("ReceiveMessage", "admin", $"{connection.UserName} has joined the chat");
        }

        [DisableCors]
        public async Task JoinSpecificChatRoom(UserConnection connection)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, connection.ChatRoom);

            _sharedDb.Connection[Context.ConnectionId] = connection;


            await Clients.Group(connection.ChatRoom)
                .SendAsync("ReceiveMessage", "admin", $"{connection.UserName} has joined the chat room {connection.ChatRoom}");

            Console.WriteLine($"ChatRoom: {connection.ChatRoom} UserName: {connection.UserName}");
            ////print out all chat rooms
            //foreach (var item in _sharedDb.Connection)
            //{
            //    Console.WriteLine($"Key: {item.Key} Value: {item.Value.ChatRoom}");
            //}
        }


        public async Task SendMessage(string msg)
        {
            if (_sharedDb.Connection.TryGetValue(Context.ConnectionId, out UserConnection connection))
            {
                Console.WriteLine($"Sending message: {msg} from user: {connection.UserName}");
                
                await Clients.Group(connection.ChatRoom)
                    .SendAsync("ReceiveSpecificMessage", connection.UserName, msg);

                Console.WriteLine("ReceiveSpecificMessage event sent");
            }
            else
            {
                Console.WriteLine("SendMessage: Connection not found");
            }
        }

        public async Task SendTicketConversationMessage(string msg)
        {
            if (_sharedDb.Connection.TryGetValue(Context.ConnectionId, out UserConnection connection))
            {
                Console.WriteLine($"Sending message: {msg} from user: {connection.UserName}");
                var ticketConversationMessage = new TicketsConversationDto { ConversationMessage = msg, TicketId = Convert.ToInt64(connection.ChatRoom), SentBy = connection.UserName };
                var result = await _ticketConverationService.CreateTicketsConversationAsync(ticketConversationMessage);

                var messageObject = new TicketChatMessage
                {
                    ConversationId = Convert.ToString(result.ID),
                    ChatRoomId = Convert.ToString(result.TicketId),
                    Date = result.CreatedDate,
                    Sender = connection.UserName,
                    Message = msg,
                    Role = connection.Role
                };

                string jsonString = JsonSerializer.Serialize(messageObject);
                await Clients.Group(connection.ChatRoom)
                    .SendAsync("ReceiveSpecificMessage", connection.UserName, jsonString);

                Console.WriteLine("ReceiveSpecificMessage event sent");
            }
            else
            {
                Console.WriteLine("SendMessage: Connection not found");
            }
        }


        public async Task SendTripConversationMessage(string msg)
        {
            if (_sharedDb.Connection.TryGetValue(Context.ConnectionId, out UserConnection connection))
            {
                Console.WriteLine($"Sending message: {msg} from user: {connection.UserName}");
                var ticketConversationMessage = new TruckCallConversationDto { ConversationMessage = msg, TruckCallId = Convert.ToInt64(connection.ChatRoom), SentBy = connection.UserName };
                var result = await _truckCallConverationService.CreateTruckCallConversationAsync(ticketConversationMessage);

                var messageObject = new TicketChatMessage
                {
                    ConversationId = Convert.ToString(result.ID),
                    ChatRoomId = Convert.ToString(result.TruckCallId),
                    Date = result.CreatedDate,
                    Sender = connection.UserName,
                    Message = msg,
                    Role = connection.Role
                };

                string jsonString = JsonSerializer.Serialize(messageObject);
                await Clients.Group(connection.ChatRoom)
                    .SendAsync("ReceiveSpecificMessage", connection.UserName, jsonString);

                Console.WriteLine("ReceiveSpecificMessage event sent");
            }
            else
            {
                Console.WriteLine("SendMessage: Connection not found");
            }
        }
    }
}*/
