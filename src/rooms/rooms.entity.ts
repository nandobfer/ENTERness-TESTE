import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from "typeorm"
import * as bcrypt from "bcrypt"
import { User, UserDto } from "../users/users.entity"
import { Message, MessageDto } from "../messages/messages.entity"
import { IsNotEmpty, IsUUID, IsOptional, IsArray, IsDate, IsBoolean } from "class-validator"

export class RoomFormDto {
    @IsNotEmpty()
    name: string

    @IsOptional()
    password?: string

    @IsUUID()
    user_id: string
}

export class JoinRoomDto {
    @IsUUID()
    room_id: string

    @IsUUID()
    user_id: string

    @IsOptional()
    password?: string
}

export class RoomDto {
    @IsUUID()
    id: string

    @IsNotEmpty()
    name: string

    @IsArray()
    users: UserDto[]

    @IsOptional()
    lastMessage: MessageDto | null

    @IsDate()
    createdAt: Date

    @IsBoolean()
    isPrivate: boolean
}

@Entity()
export class Room extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    name: string

    @Column({ nullable: true })
    password?: string

    @ManyToMany(() => User, (user) => user.rooms, { cascade: true })
    @JoinTable()
    users: Relation<User>[]

    @OneToMany(() => Message, (message) => message.room)
    messages: Relation<Message>[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    constructor() {
        super()
    }

    async getDto() {
        const lastMessage = await Message.findOne({
            where: { room: { id: this.id } },
            order: { createdAt: "DESC" },
            relations: { author: true },
        })

        if (lastMessage) {
            lastMessage.room = this
        }

        return {
            id: this.id,
            name: this.name,
            users: this.users.map((user) => user.getDto()),
            lastMessage: lastMessage ? lastMessage.getDto() : null,
            createdAt: this.createdAt,
            isPrivate: !!this.password,
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        if (!this.password) return true

        return await bcrypt.compare(password, this.password)
    }

    async getMessages() {
        const messages = await Message.find({ where: { room: { id: this.id } }, relations: { author: true } })
        for (const message of messages) {
            message.room = this
        }
        return messages
    }
}
