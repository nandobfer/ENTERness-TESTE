import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { EventsGateway } from "../events/events.gateway"
import { Room, RoomFormDto, RoomAndUserIdsDto } from "./rooms.entity"
import { UsersService } from "../users/users.service"
import { OnEvent } from "@nestjs/event-emitter"
import { Socket } from "socket.io"
import { Message, MessageForm } from "../messages/messages.entity"

@Injectable()
export class RoomsService {
    private readonly users: UsersService
    private readonly io: EventsGateway

    constructor(eventsGateway: EventsGateway) {
        this.io = eventsGateway
    }

    async new(data: RoomFormDto) {
        const user = await this.users.find(data.user_id)

        if (!user) {
            throw new HttpException("User not online", HttpStatus.NOT_FOUND)
        }

        const room = Room.create({ name: data.name, password: data.password, users: [user] })
        await room.save()

        user.socket?.join(room.id)
        this.io.server.emit("rooms:new", room.getDto())

        return room
    }

    async find(id: string) {
        const room = await Room.findOne({ where: { id }, relations: { users: true } })
        return room
    }

    async getAll() {
        const rooms = await Room.find({ relations: { users: true } })
        return rooms
    }

    @OnEvent("room:join")
    async handleRoomJoin(socket: Socket, data: RoomAndUserIdsDto, ack?: Function) {
        const room = await this.find(data.room_id)
        const user = await this.users.find(data.user_id)

        if (!room) {
            throw new HttpException("Room not found", HttpStatus.NOT_FOUND)
        }

        if (!user) {
            throw new HttpException("User not online", HttpStatus.NOT_FOUND)
        }

        socket.join(room.id)
        room.users.push(user)
        await room.save()

        ack?.()
        socket.broadcast.to(room.id).emit("room:join", user.getDto())
        this.io.server.to(room.id).emit("room:users", room.users.length)
    }

    @OnEvent("room:leave")
    async handleRoomLeave(socket: Socket, data: RoomAndUserIdsDto, ack?: Function) {
        const room = await this.find(data.room_id)
        const user = await this.users.find(data.user_id)

        if (!room) {
            throw new HttpException("Room not found", HttpStatus.NOT_FOUND)
        }

        if (!user) {
            throw new HttpException("User not online", HttpStatus.NOT_FOUND)
        }

        
        room.users = room.users.filter((u) => u.id !== user.id)
        await room.save()

        ack?.()
        socket.broadcast.to(room.id).emit("room:leave", user.getDto())
        socket.leave(room.id)
        this.io.server.to(room.id).emit("room:users", room.users.length)

    }

    @OnEvent("room:message")
    async handleMessage(socket: Socket, data: MessageForm, ack: Function) {
        const room = await this.find(data.roomId)
        const user = await this.users.find(data.authorId)
        const message = Message.create({ content: data.content, author: user, room: room })
        await message.save()
        ack()
        socket.broadcast.to(room.id).emit("room:message", message)
    }
}
