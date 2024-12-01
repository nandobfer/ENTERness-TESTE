import { EventEmitter2 } from "@nestjs/event-emitter"
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { ChatJoinForm } from "src/class/Chat"
import { MessageForm } from "src/class/Message"
import { UserForm } from "src/class/User"
import { UsersService } from "src/users/users.service"

@WebSocketGateway({ cors: { origin: "*" } })
export class EventsGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    constructor(
        private readonly users: UsersService,
        private eventEmitter: EventEmitter2
    ) {}

    handleDisconnect(client: Socket) {
        this.users.logout(client)
    }

    @SubscribeMessage("users:login")
    handleLogin(client: Socket, data: UserForm) {
        const user = this.users.login(data, client)
        this.eventEmitter.emit("user:login", user, client)
        return user
    }

    @SubscribeMessage("chat:join")
    handleChatJoin(client: Socket, data: ChatJoinForm) {
        this.eventEmitter.emit("chat:join", data, client)
    }

    @SubscribeMessage("chat:message")
    handleChatMessage(client: Socket, data: MessageForm) {
        this.eventEmitter.emit("chat:message", data, client)
    }
}
