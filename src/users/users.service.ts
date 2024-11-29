import { Injectable } from "@nestjs/common"
import { randomUUID } from "crypto"
import { User, UserForm } from "src/class/User"

@Injectable()
export class UsersService {
    private readonly users: User[] = []

    new(data: UserForm) {
        console.log(data)
        const user = new User({ id: randomUUID(), status: "available", username: data.username })
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
}
