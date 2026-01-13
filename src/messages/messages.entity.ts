import { IsNotEmpty, IsUUID } from "class-validator"
import { Room } from "../rooms/rooms.entity"
import { User } from "../users/users.entity"
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm"

export class MessageForm {
    @IsNotEmpty()
    content: string

    @IsUUID()
    roomId: string

    @IsUUID()
    authorId: string
}

@Entity()
export class Message extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
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
}
