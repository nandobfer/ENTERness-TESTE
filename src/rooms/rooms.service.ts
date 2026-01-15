import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { EventsGateway } from "../events/events.gateway"
import { Room, RoomFormDto, JoinRoomDto } from "./rooms.entity"
import { UsersService } from "../users/users.service"
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter"
import { Socket } from "socket.io"
import { Message, MessageForm } from "../messages/messages.entity"
import * as bcrypt from "bcrypt"

@Injectable()
export class RoomsService {
    private readonly users: UsersService
    private readonly io: EventsGateway

    constructor(
        eventsGateway: EventsGateway,
        usersService: UsersService,
        private eventEmitter: EventEmitter2
    ) {
        this.io = eventsGateway
        this.users = usersService
    }

    async find(id: string) {
        const room = await Room.findOne({ where: { id }, relations: { users: true } })
        return room
    }

    async getAll() {
        const rooms = await Room.find({ relations: { users: true } })
        return rooms
    }

    countConnectedUsers(roomId: string) {
        const room = this.io.server.sockets.adapter.rooms.get(roomId)
        return room ? room.size : 0
    }

    @OnEvent("room:new")
    async handleNewRoom(socket: Socket, data: RoomFormDto) {
        const user = await this.users.find(data.user_id)

        if (!user) {
            throw new HttpException("User not online", HttpStatus.NOT_FOUND)
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10)
        }

        const room = Room.create({ name: data.name, password: data.password, users: [user] })
        await room.save()
        const roomDto = await room.getDto()

        socket.join(room.id)
        socket.data.rooms.add(room.id)
        socket.broadcast.emit("rooms:new", roomDto)
        if (socket) {
            console.log("enviado para todos")
        }

        return { room: roomDto }
    }

    @OnEvent("room:join")
    async handleRoomJoin(socket: Socket, data: JoinRoomDto) {
        const room = await this.find(data.room_id)
        const user = await this.users.find(data.user_id)

        if (!room) {
            throw new HttpException("Room not found", HttpStatus.NOT_FOUND)
        }

        if (!user) {
            throw new HttpException("User not online", HttpStatus.NOT_FOUND)
        }

        if (!(await room.validatePassword(data.password))) {
            return { error: "senha inválida" }
        }

        room.users.push(user)
        await room.save()
        socket.join(room.id)
        socket.data.rooms.add(room.id)
        this.eventEmitter.emit("room:emit-online", room.id)
        return { room: await room.getDto() }
    }

    @OnEvent("room:leave")
    async handleRoomLeave(socket: Socket, data: JoinRoomDto) {
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

        socket.leave(room.id)
        socket.data.rooms.delete(room.id)
        this.eventEmitter.emit("room:emit-online", room.id)
        return { room: await room.getDto() }
    }

    @OnEvent("room:message")
    async handleMessage(socket: Socket, data: MessageForm) {
        const room = await this.find(data.roomId)
        const user = await this.users.find(data.authorId)
        const message = Message.create({ content: data.content, author: user, room: room })
        await message.save()
        socket.broadcast.to(room.id).emit("room:message", message.getDto())
        return { message: message.getDto() }
    }
}
