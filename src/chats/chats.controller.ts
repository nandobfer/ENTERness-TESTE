import { Body, Controller, Delete, Get, Post, Query } from "@nestjs/common"
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
    async createChat(@Body() data: ChatForm) {
        return await this.service.new(data)
    }

    @Get("user")
    async getUserChats(@Query("user_id") user_id: string) {
        return await this.service.getUserChats(user_id)
    }

    @Delete("user")
    async removeUserFromChat(@Query("user_id") user_id: string, @Query("chat_id") chat_id: string) {
        return await this.service.removeUser({ user_id, chat_id })
    }
}
