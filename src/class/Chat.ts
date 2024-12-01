import { prisma } from "src/prisma"
import { Message, MessageForm } from "./Message"
import { User } from "./User"
import { Prisma } from "@prisma/client"

export const chat_prisma_include = Prisma.validator<Prisma.ChatInclude>()({ users: true, messages: { orderBy: { createdAt: "asc" } }, owner: true })
export type ChatPrisma = Prisma.ChatGetPayload<{ include: typeof chat_prisma_include }>

export class ChatJoinForm {
    chat_id: string
    user_id: string
}

export class ChatForm {
    owner_id: string
    name: string
    password?: string
}

export class Chat {
    id: string
    name: string
    messages: Message[]
    owner: User
    users: User[]
    createdAt: string

    lastMessage?: Message
    password?: string

    constructor(data: ChatPrisma) {
        this.id = data.id
        this.name = data.name
        this.messages = data.messages.map((item) => new Message(item))
        this.owner = new User(data.owner)
        this.users = data.users.map((item) => new User(item))
        this.password = data.password
        this.lastMessage = !!this.messages.length ? this.messages[this.messages.length - 1] : undefined
        this.createdAt = data.createdAt
    }

    async registerUser(user: User) {
        const result = await prisma.chat.update({
            where: { id: this.id },
            data: { users: { connect: { id: user.id } } },
            include: chat_prisma_include,
        })
        this.users.push(user)
    }

    async newMessage(data: MessageForm) {
        const result = await prisma.message.create({
            data: {
                id: data.id,
                body: data.body,
                chatId: this.id,
                userId: data.user_id,
                createdAt: new Date().getTime().toString(),
                authorUsername: data.username,
            },
        })

        return new Message(result)
    }
}
