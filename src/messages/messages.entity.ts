import { IsDate, IsNotEmpty, IsObject, IsUUID } from "class-validator"
import { Room } from "../rooms/rooms.entity"
import { User, UserDto } from "../users/users.entity"
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm"

export class MessageForm {
    @IsNotEmpty()
    content: string

    @IsUUID()
    roomId: string

    @IsUUID()
    authorId: string
}

export class MessageDto {
    @IsUUID()
    id: string

    @IsNotEmpty()
    content: string

    @IsUUID()
    roomId: string

    @IsDate()
    createdAt: Date

    @IsObject()
    author: UserDto
}

@Entity()
export class Message extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ type: "text" })
    content: string

    @ManyToOne(() => User, (user) => user.messages)
    author: Relation<User>

    @ManyToOne(() => Room, (room) => room.messages, { cascade: true })
    room: Relation<Room>

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    constructor() {
        super()
    }

    getDto(): MessageDto {
        return {
            id: this.id,
            content: this.content,
            roomId: this.room.id,
            createdAt: this.createdAt,
            author: this.author.getDto(),
        }
    }
}
