import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { UserForm } from "src/class/User"
import { UsersService } from "src/users/users.service"

@WebSocketGateway({ cors: { origin: "*" } })
export class EventsGateway implements OnGatewayDisconnect {
    private readonly users: UsersService

    @WebSocketServer()
    server: Server

    constructor(usersService: UsersService) {
        this.users = usersService
    }

    handleDisconnect(client: Socket) {
        this.users.logout(client)
    }

    @SubscribeMessage("users:login")
    handleMessage(client: Socket, data: UserForm) {
        const user = this.users.login(data, client)
        return user
    }
}
