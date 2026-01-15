import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { Socket } from "socket.io"
import { User, UserDto, UserFormDto } from "./users.entity"
import * as bcrypt from "bcrypt"
import { QueryFailedError } from "typeorm"

@Injectable()
export class UsersService {
    constructor(private eventEmitter: EventEmitter2) {}

    async new(data: UserFormDto) {
        try {
            const hashedPassword = await bcrypt.hash(data.password.trim(), 10)
            const user = User.create({ email: data.email.toLowerCase().trim(), password: hashedPassword })
            await user.save()
            return user
        } catch (error) {
            console.log(error)
            if (error instanceof QueryFailedError) {
                throw new HttpException("Email already in use", HttpStatus.FORBIDDEN)
            }
        }
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
        return await User.findOne({ where: [{ id: value }, { email: value }], relations: { rooms: true } })
    }

    async getAll() {
        const users = await User.find()
        return users
    }

    async onSocketConnect(socket: Socket, dto: UserDto) {
        const user = await this.find(dto.id)
        for (const room of user.rooms) {
            socket.join(room.id)
            socket.data.rooms.add(room.id)
            this.eventEmitter.emit("room:emit-online", room.id)
        }
    }
}
