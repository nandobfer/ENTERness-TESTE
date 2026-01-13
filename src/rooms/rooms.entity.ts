import { BaseEntity, Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm"
import * as bcrypt from "bcrypt"
import { User } from "../users/users.entity"
import { Message } from "../messages/messages.entity"
import { IsNotEmpty, IsUUID } from "class-validator"

export class RoomFormDto {
    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    password: string

    @IsUUID()
    user_id: string
}

export class RoomAndUserIdsDto {
    @IsUUID()
    room_id: string

    @IsUUID()
    user_id: string
}

export class RoomDto {
    @IsUUID()
    id: string

    @IsNotEmpty()
    name: string
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
    users: Relation<User>[]

    @OneToMany(() => Message, (message) => message.room)
    messages: Relation<Message>[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    constructor() {
        super()

        console.log(this)
    }

    getDto(): RoomDto {
        return {
            id: this.id,
            name: this.name,
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password)
    }
}
