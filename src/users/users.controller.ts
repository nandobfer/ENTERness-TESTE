import { Controller, Get } from "@nestjs/common"
import { UsersService } from "./users.service"

@Controller("users")
export class UsersController {
    private service: UsersService

    constructor(service: UsersService) {
        this.service = service
    }

    @Get()
    getAll() {
        return this.service.getAll()
    }
}
