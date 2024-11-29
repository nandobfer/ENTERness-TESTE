import { Controller, Get } from "@nestjs/common"
import { ChatsService } from "./chats.service"

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
}
