import { Socket } from "socket.io"
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm"
import * as bcrypt from "bcrypt"
import { Message } from "../messages/messages.entity"
import { Room } from "../rooms/rooms.entity"
import { IsEmail, IsNotEmpty, IsUUID } from "class-validator"

export class UserFormDto {
    @IsEmail()
    email: string

    @IsNotEmpty()
    password: string
}

export class UserDto {
    @IsUUID()
    id: string

    @IsEmail()
    email: string
}

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ unique: true })
    email: string

    @Column()
    password: string

    @OneToMany(() => Message, (message) => message.author)
    messages: Relation<Message>[]

    @ManyToMany(() => Room, (room) => room.users)
    rooms: Relation<Room>[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    socket?: Socket

    constructor() {
        super()
    }

    getDto(): UserDto {
        return {
            id: this.id,
            email: this.email,
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password)
    }
}
