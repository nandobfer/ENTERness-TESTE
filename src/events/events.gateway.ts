import { EventEmitter2, OnEvent } from "@nestjs/event-emitter"
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { MessageForm } from "../messages/messages.entity"
import { JoinRoomDto, RoomFormDto } from "../rooms/rooms.entity"
import { UsersService } from "../users/users.service"
import { JwtService } from "@nestjs/jwt"
import { UserDto } from "../users/users.entity"

@WebSocketGateway({ cors: { origin: "*" } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    constructor(
        private readonly users: UsersService,
        private eventEmitter: EventEmitter2,
        private jwtService: JwtService
    ) {}

    handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth?.token

            if (!token) {
                client.emit("error", "Unauthorized: No token provided")
                client.disconnect()
                return
            }

            const payload = this.jwtService.verify<{ user: UserDto }>(token as string)
            client.data.user = payload.user // stored user dto
            client.data.rooms = new Set<string>()
            // console.log(`Client connected: ${client.id}, user: ${payload.user.email}`)
            this.users.onSocketConnect(client, payload.user)
        } catch (error) {
            client.emit("error", "Unauthorized: Invalid token")
            client.disconnect()
        }
    }

    handleDisconnect(client: Socket) {
        // console.log(`Client disconnected: ${client.id}, user: ${client.data.user?.email}`)
        const rooms = client.data.rooms as Set<string>
        for (const roomId of rooms) {
            if (roomId !== client.id) {
                this.emitConnectedUsersInRoom(roomId)
            }
        }
    }

    @SubscribeMessage("room:new")
    async handleChatNew(client: Socket, data: RoomFormDto) {
        return await this.eventEmitter.emitAsync("room:new", client, data).then((results) => results[0])
    }

    @SubscribeMessage("room:join")
    async handleChatJoin(client: Socket, data: JoinRoomDto) {
        return await this.eventEmitter.emitAsync("room:join", client, data).then((results) => results[0])
    }

    @SubscribeMessage("room:leave")
    async handleChatLeave(client: Socket, data: JoinRoomDto) {
        return await this.eventEmitter.emitAsync("room:leave", client, data).then((results) => results[0])
    }

    @SubscribeMessage("room:message")
    async handleChatMessage(client: Socket, data: MessageForm) {
        return await this.eventEmitter.emitAsync("room:message", client, data).then((results) => results[0])
    }

    @OnEvent("room:emit-online")
    handleEmitOnlineUsersInRoom(roomId: string) {
        this.emitConnectedUsersInRoom(roomId)
    }

    private emitConnectedUsersInRoom(roomId: string) {
        const room = this.server.sockets.adapter.rooms.get(roomId)
        const online = room ? room.size : 0
        // console.log(`room:${roomId}:online`, online)
        this.server.emit(`room:${roomId}:online`, online)
    }
}
