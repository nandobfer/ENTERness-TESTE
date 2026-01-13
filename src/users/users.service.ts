import { Injectable } from "@nestjs/common"
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter"
import { Socket } from "socket.io"
import { User, UserFormDto } from "./users.entity"
import * as bcrypt from "bcrypt"

@Injectable()
export class UsersService {
    readonly online_users: User[] = []

    constructor(private eventEmitter: EventEmitter2) {}

    async new(data: UserFormDto) {
        const hashedPassword = await bcrypt.hash(data.password.trim(), 10)
        const user = User.create({ email: data.email.toLowerCase().trim(), password: hashedPassword })
        await user.save()
        return user
    }

    async login(data: UserFormDto) {
        const user = await User.findOne({ where: { email: data.email.toLowerCase().trim() } })

        if (user) {
            const validPassword = await user.validatePassword(data.password.trim())
            if (validPassword) {
                return user
            } else {
                throw new Error("Invalid password")
            }
        }
    }

    async find(value: string): Promise<User> {
        const user =
            this.online_users.find((user) => user.id === value || user.email === value) ||
            (await User.findOne({ where: [{ id: value }, { email: value }] }))
        return user
    }

    async getAll() {
        const users = await User.find()
        return users
    }

    getOnline() {
        return this.online_users.map((user) => user.getDto())
    }

    logout(socket: Socket) {
        const index = this.online_users.findIndex((user) => user.socket.id === socket.id)
        if (index !== -1) {
            this.online_users.splice(index, 1)
        }
    }

    async onLogin(socket: Socket, userId: string, ack: Function) {
        const user = await this.find(userId)
        user.socket = socket
        this.online_users.push(user)
        ack()
        return user
    }
}
