import { WithoutFunctions } from "src/helpers"
import { Message } from "./Message"
import { User } from "./User"

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

    constructor(data: WithoutFunctions<Chat>) {
        this.id = data.id
        this.name = data.name
        this.messages = data.messages
        this.owner = data.owner
        this.users = data.users
        this.password = data.password
        this.lastMessage = data.lastMessage
    }

    handleOwnerDisconnect() {
        if (!!this.users.length) {
            this.owner = this.users[0]
        }
    }
}
