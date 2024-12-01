import { Prisma } from "@prisma/client"
import { WithoutFunctions } from "src/helpers"

export type MessagePrisma = Prisma.MessageGetPayload<{}>

export class Message {
    id: string
    body: string
    author_id: string

    constructor(data: MessagePrisma) {
        this.id = data.id
        this.body = data.body
        this.author_id = data.userId
    }
}
