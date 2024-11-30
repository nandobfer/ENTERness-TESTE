import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { Chat, ChatForm } from "../class/Chat"
import { randomUUID } from "crypto"
import { UsersService } from "src/users/users.service"
import { EventsGateway } from "src/events/events.gateway"
import { OnEvent } from "@nestjs/event-emitter"
import { User } from "src/class/User"

@Injectable()
export class ChatsService {
    private readonly users: UsersService
    private readonly io: EventsGateway
    private readonly chats: Chat[] = []

    constructor(usersService: UsersService, eventsGateway: EventsGateway) {
        this.users = usersService
        this.io = eventsGateway
    }

    new(data: ChatForm) {
        const owner = this.users.findById(data.owner_id)
        if (!owner) throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND)

        const chat = new Chat({ id: randomUUID(), name: data.name, password: data.password, owner, messages: [], users: [] })
        this.chats.push(chat)

        this.io.server.emit("chats:new", chat)

        return chat
    }

    getAll() {
        return this.chats
    }

    getUserChats(user_id: string) {
        return this.chats.filter((chat) => chat.owner.id === user_id)
    }

    removeChat(index: number) {
        this.chats.splice(index, 1)
    }

    @OnEvent("users:disconnect")
    handleUserDisconnect(user: User) {
        console.log(`disconnected user ${user.username}`)
        this.chats.forEach((chat, index) => {
            if (chat.owner.id === user.id) {
                if (!!chat.users.length) {
                    chat.handleOwnerDisconnect()
                } else {
                    this.removeChat(index)
                }
            }
        })
    }
}
