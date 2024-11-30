import { Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { randomUUID } from "crypto"
import { Socket } from "socket.io"
import { User, UserForm } from "src/class/User"

@Injectable()
export class UsersService {
    private readonly users: User[] = []

    constructor(private eventEmitter: EventEmitter2) {}

    new(data: UserForm, socket: Socket) {
        console.log(data)
        const user = new User({ id: randomUUID(), status: "available", username: data.username, socket })
        this.users.push(user)
        return user
    }

    getAll() {
        return this.users
    }

    findById(id: string) {
        return this.users.find((item) => item.id === id)
    }

    findByUsername(username: string) {
        return this.users.find((item) => item.username === username)
    }

    findBySocketId(socket: Socket) {
        return this.users.find((item) => item.socket.id === socket.id)
    }

    onDisconnect(socket: Socket) {
        const index = this.users.findIndex((user) => user.socket.id === socket.id)
        if (index !== -1) {
            this.eventEmitter.emit("users:disconnect", this.users[index])
            this.users.splice(index, 1)
        } else {
            console.log("no user found")
        }
    }
}
