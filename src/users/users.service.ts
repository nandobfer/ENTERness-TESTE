import { Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { randomUUID } from "crypto"
import { Socket } from "socket.io"
import { User, UserForm } from "src/class/User"
import { prisma } from "src/prisma"

@Injectable()
export class UsersService {
    private readonly online_users: User[] = []

    constructor(private eventEmitter: EventEmitter2) {}

    async new(data: UserForm) {
        const userPrisma = await prisma.user.create({ data })
        const user = new User(userPrisma)
        return user
    }

    async login(data: UserForm, socket: Socket) {
        const result = (await this.find("username", data.username)) || (await this.new(data))
        const user = new User(result, socket)
        this.online_users.push(user)
        return user
    }

    getAll() {
        return this.online_users
    }

    async find(attribute: "id" | "username", value: string): Promise<User | null> {
        const result = await prisma.user.findFirst({
            where: { id: attribute === "id" ? value : undefined, username: attribute === "username" ? value : undefined },
        })
        return result ? new User(result) : null
    }

    isOnline(username: string) {
        return this.online_users.find((user) => user.username === username)
    }

    findOnline(id: string) {
        return this.online_users.find((user) => user.id === id)
    }

    logout(socket: Socket) {
        const index = this.online_users.findIndex((user) => user.socket.id === socket.id)
        if (index !== -1) {
            this.eventEmitter.emit("users:disconnect", this.online_users[index])
            this.online_users.splice(index, 1)
        }
    }
}
