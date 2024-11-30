import { Socket } from "socket.io"
import { WithoutFunctions } from "src/helpers"

export type UserStatus = "available" | "idle"

export class UserForm {
    username: string
}

export class User {
    id: string
    username: string
    status: UserStatus
    socket: Socket

    constructor(data: WithoutFunctions<User>) {
        this.id = data.id
        this.username = data.username
        this.status = data.status
        this.socket = data.socket
    }

    toJSON() {
        return { ...this, socket: null }
    }
}
