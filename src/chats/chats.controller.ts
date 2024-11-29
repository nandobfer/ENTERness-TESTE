import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ChatsService } from "./chats.service"
import { ChatForm } from "src/class/Chat"

@Controller("chats")
export class ChatsController {
    private service: ChatsService

    constructor(service: ChatsService) {
        this.service = service
    }

    @Get()
    getAll() {
        return this.service.getAll()
    }

    @Post()
    createChat(@Body() data: ChatForm) {
        return this.service.new(data)
    }

    @Get("user")
    getUserChats(@Query("user_id") user_id: string) {
        return this.service.getUserChats(user_id)
    }
}
