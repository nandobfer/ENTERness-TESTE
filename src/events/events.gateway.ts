import { EventEmitter2 } from "@nestjs/event-emitter"
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { MessageForm } from "../messages/messages.entity"
import { RoomAndUserIdsDto } from "../rooms/rooms.entity"
import { UsersService } from "../users/users.service"

@WebSocketGateway({ cors: { origin: "*" } })
export class EventsGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    constructor(
        private readonly users: UsersService,
        private eventEmitter: EventEmitter2
    ) {}

    handleDisconnect(client: Socket) {
        const loggedOutUser = this.users.online_users.find((user) => user.socket.id === client.id)
        this.users.logout(client)
        this.server.emit("user:logout", loggedOutUser?.getDto())
    }

    @SubscribeMessage("user:login")
    async handleUserLogin(client: Socket, userId: string, ack: Function) {
        const user = await this.users.onLogin(client, userId, ack)
        this.server.emit("user:login", user.getDto())
    }

    @SubscribeMessage("room:join")
    handleChatJoin(client: Socket, data: RoomAndUserIdsDto, ack: Function) {
        this.eventEmitter.emit("room:join", client, data, ack)
    }

    @SubscribeMessage("room:leave")
    handleChatLeave(client: Socket, data: RoomAndUserIdsDto, ack: Function) {
        this.eventEmitter.emit("room:leave", client, data, ack)
    }

    @SubscribeMessage("room:message")
    handleChatMessage(client: Socket, data: MessageForm, ack: Function) {
        this.eventEmitter.emit("room:message", client, data, ack)
    }
}
