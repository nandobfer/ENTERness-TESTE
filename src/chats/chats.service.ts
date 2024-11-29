import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { Chat, ChatForm } from "../class/Chat"
import { randomUUID } from "crypto"
import { UsersService } from "src/users/users.service"

@Injectable()
export class ChatsService {
    private readonly usersService: UsersService
    private readonly chats: Chat[] = []

    constructor(usersService: UsersService) {
        this.usersService = usersService
    }

    new(data: ChatForm) {
        const owner = this.usersService.findById(data.owner_id)
        if (!owner) throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND)

        const chat = new Chat({ id: randomUUID(), name: data.name, password: data.password, owner, messages: [], users: [] })
        return chat
    }

    getAll() {
        return this.chats
    }

    getUserChats(user_id: string) {
        return this.chats.filter((chat) => chat.owner.id === user_id)
    }
}
