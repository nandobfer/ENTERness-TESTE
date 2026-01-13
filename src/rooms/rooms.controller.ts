import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common"
import { RoomsService } from "./rooms.service"
import { RoomFormDto } from "./rooms.entity"
import { AuthGuard } from "../auth/auth.guard"

@Controller("rooms")
export class RoomsController {
    private service: RoomsService

    constructor(service: RoomsService) {
        this.service = service
    }

    @UseGuards(AuthGuard)
    @Get()
    async getAll() {
        return await this.service.getAll()
    }

    @UseGuards(AuthGuard)
    @Post()
    async createRoom(@Body() data: RoomFormDto) {
        return await this.service.new(data)
    }


}
