import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common"
import { RoomsService } from "./rooms.service"
import { RoomFormDto } from "./rooms.entity"
import { AuthGuard } from "../auth/auth.guard"
import { IsUUID } from "class-validator"

class RoomParams {
    @IsUUID()
    id: string
}

@Controller("rooms")
export class RoomsController {
    private service: RoomsService

    constructor(service: RoomsService) {
        this.service = service
    }

    @UseGuards(AuthGuard)
    @Get()
    async getAll() {
        const rooms = await this.service.getAll()
        return await Promise.all(rooms.map(async (room) => await room.getDto()))
    }

    @UseGuards(AuthGuard)
    @Get(":id/online-count")
    async countConnectedUsers(@Param("id") id: string) {
        return this.service.countConnectedUsers(id)
    }

    @UseGuards(AuthGuard)
    @Get(":id/messages")
    async getMessages(@Param("id") id: string) {
        const room = await this.service.find(id)
        const messages = await room.getMessages()
        return messages.map((message) => message.getDto())
    }
}
