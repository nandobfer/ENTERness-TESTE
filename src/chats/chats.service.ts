import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { Chat, chat_prisma_include, ChatForm, ChatJoinForm } from "../class/Chat"
import { randomUUID } from "crypto"
import { UsersService } from "src/users/users.service"
import { EventsGateway } from "src/events/events.gateway"
import { OnEvent } from "@nestjs/event-emitter"
import { User } from "src/class/User"
import { prisma } from "src/prisma"
import { MessageForm } from "src/class/Message"
import { Socket } from "socket.io"

@Injectable()
export class ChatsService {
    private readonly users: UsersService
    private readonly io: EventsGateway

    constructor(usersService: UsersService, eventsGateway: EventsGateway) {
        this.users = usersService
        this.io = eventsGateway
    }

    async new(data: ChatForm) {
        const owner = this.users.findOnline(data.owner_id)
        if (!owner) throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND)

        const chatPrisma = await prisma.chat.create({
            data: { name: data.name, ownerId: data.owner_id, password: data.password, createdAt: new Date().getTime().toString() },
            include: chat_prisma_include,
        })
        const chat = new Chat(chatPrisma)

        this.io.server.emit("chats:new", chat)
        owner.socket.emit("chats:join", chat)

        return chat
    }

    async find(id: string) {
        const result = await prisma.chat.findUnique({ where: { id }, include: chat_prisma_include })
        return new Chat(result)
    }

    async getAll() {
        const result = await prisma.chat.findMany({ include: chat_prisma_include })
        return result.map((item) => new Chat(item))
    }

    async getUserChats(user_id: string) {
        const result = await prisma.chat.findMany({
            where: { OR: [{ ownerId: user_id }, { users: { some: { id: user_id } } }] },
            orderBy: { createdAt: "asc" },
            include: chat_prisma_include,
        })
        return result.map((item) => new Chat(item))
    }

    async removeUser(data: ChatJoinForm, new_owner?: User) {
        const result = await prisma.chat.update({
            where: { id: data.chat_id },
            data: { users: { disconnect: { id: data.user_id } }, ownerId: new_owner ? new_owner.id : undefined },
        })

        return true
    }

    async deleteChat(chat_id: string) {
        await prisma.chat.delete({ where: { id: chat_id } })
        this.io.server.emit("chats:delete", chat_id)
        return true
    }

    async handleUserLeave(data: ChatJoinForm) {
        const user = this.users.findOnline(data.user_id)
        user.socket.emit("chats:unjoin", data.chat_id)

        const chat = await this.find(data.chat_id)
        if (chat.owner.id === user.id) {
            if (!!chat.users.length) {
                const new_owner = chat.users[0]
                await this.removeUser({ chat_id: chat.id, user_id: new_owner.id }, new_owner)
            } else {
                await this.deleteChat(chat.id)
            }
        } else {
            await this.removeUser(data)
        }

        return true
    }

    @OnEvent("user:login")
    async handleUserLogin(user: User, socket: Socket) {
        const chats = await this.getUserChats(user.id)
        chats.forEach((chat) => {
            socket.join(chat.id)
        })
    }

    @OnEvent("chat:join")
    async handleChatJoin(data: ChatJoinForm, socket: Socket) {
        const chat = await this.find(data.chat_id)
        if (chat.owner.id !== data.user_id && !chat.users.find((user) => user.id === data.user_id)) {
            const user = this.users.findOnline(data.user_id)
            await chat.registerUser(user)
            socket.join(chat.id)
            user.socket.emit("chats:join", chat)
        }
    }

    @OnEvent("chat:message")
    async handleNewMessage(data: MessageForm, socket: Socket) {
        const chat = await this.find(data.chat_id)
        const message = await chat.newMessage(data)

        this.io.server.to(chat.id).emit("chat:message", message)
    }
}
