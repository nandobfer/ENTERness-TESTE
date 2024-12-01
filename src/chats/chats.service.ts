import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { Chat, chat_prisma_include, ChatForm, ChatJoinForm } from "../class/Chat"
import { randomUUID } from "crypto"
import { UsersService } from "src/users/users.service"
import { EventsGateway } from "src/events/events.gateway"
import { OnEvent } from "@nestjs/event-emitter"
import { User } from "src/class/User"
import { prisma } from "src/prisma"

@Injectable()
export class ChatsService {
    private readonly users: UsersService
    private readonly io: EventsGateway

    constructor(usersService: UsersService, eventsGateway: EventsGateway) {
        this.users = usersService
        this.io = eventsGateway
    }

    async new(data: ChatForm) {
        const owner = await this.users.find("id", data.owner_id)
        if (!owner) throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND)

        const chatPrisma = await prisma.chat.create({
            data: { name: data.name, ownerId: data.owner_id, password: data.password },
            include: chat_prisma_include,
        })
        const chat = new Chat(chatPrisma)

        this.io.server.emit("chats:new", chat)

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
            include: chat_prisma_include,
        })
        return result.map((item) => new Chat(item))
    }

    async removeUser(data: ChatJoinForm) {
        const user = this.users.findOnline(data.user_id)
        user.socket.emit("chats:unjoin", data.chat_id)
        const result = await prisma.chat.update({ where: { id: data.chat_id }, data: { users: { disconnect: { id: data.user_id } } } })
        return true
    }

    @OnEvent("chat:join")
    async handleChatJoin(data: ChatJoinForm) {
        const chat = await this.find(data.chat_id)
        if (chat.owner.id !== data.user_id && !chat.users.find((user) => user.id === data.user_id)) {
            const user = this.users.findOnline(data.user_id)
            await chat.registerUser(user)
            user.socket.emit("chats:new", chat)
        }
    }
}
