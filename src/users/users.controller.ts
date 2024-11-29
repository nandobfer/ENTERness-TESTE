import { Body, Controller, Get, HttpException, HttpStatus, Post, Query } from "@nestjs/common"
import { UsersService } from "./users.service"
import { UserForm } from "src/class/User"

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

    @Get("username")
    checkUsername(@Query("username") username: string) {
        if (!username) throw new HttpException("Username param is required", HttpStatus.BAD_REQUEST)

        return { valid: !this.service.findByUsername(username) }
    }

    @Post()
    createUser(@Body() data: UserForm) {
        const user = this.service.new(data)
        return user
    }
}
