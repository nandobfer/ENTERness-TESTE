import { Body, Controller, Post } from "@nestjs/common"
import { UsersService } from "./users.service"
import { UserFormDto } from "./users.entity"


@Controller("users")
export class UsersController {
    private service: UsersService

    constructor(service: UsersService) {
        this.service = service
    }

    @Post("")
    async createUser(@Body() data: UserFormDto) {
        const user = await this.service.new(data)
        return true
    }

}
