import { Prisma } from "@prisma/client"
import { Socket } from "socket.io"

export type UserPrisma = Prisma.UserGetPayload<{}>

export type UserStatus = "available" | "idle"

export class UserForm {
    username: string
}

export class User {
    id: string
    username: string
    status: UserStatus
    socket?: Socket

    constructor(data: UserPrisma, socket?: Socket) {
        this.id = data.id
        this.username = data.username
        this.status = "available"

        this.socket = socket
    }

    toJSON() {
        return { ...this, socket: null }
    }
}
