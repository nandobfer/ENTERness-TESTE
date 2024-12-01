import { Message } from "./Message"
import { User } from "./User"
import { Prisma } from "@prisma/client"

export const chat_prisma_include = Prisma.validator<Prisma.ChatInclude>()({ users: true, messages: true, owner: true, lastMessage: true })
export type ChatPrisma = Prisma.ChatGetPayload<{ include: typeof chat_prisma_include }>

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

    lastMessage?: Message
    password?: string

    constructor(data: ChatPrisma) {
        this.id = data.id
        this.name = data.name
        this.messages = data.messages.map((item) => new Message(item))
        this.owner = new User(data.owner)
        this.users = data.users.map((item) => new User(item))
        this.password = data.password
        this.lastMessage = data.lastMessage ? new Message(data.lastMessage) : undefined
    }

    handleOwnerLeave() {
        if (!!this.users.length) {
            this.owner = this.users[0]
        }
    }
}
