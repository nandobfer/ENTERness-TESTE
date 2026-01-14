import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query } from "@nestjs/common"
import { UsersService } from "./users.service"
import { UserFormDto } from "./users.entity"
import { IsEmail, IsUUID } from "class-validator"

class UserQueriesDto {
    @IsEmail()
    email: string
}

class UserParams {
    @IsUUID()
    id: string
}

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

    @Get("online")
    getOnlineUsers() {
        return this.service.getOnline()
    }

    @Post("")
    async createUser(@Body() data: UserFormDto) {
        const user = await this.service.new(data)
        return true
    }

    @Get("email")
    checkEmail(@Query() query: UserQueriesDto) {
        if (!query.email) throw new HttpException("email param is required", HttpStatus.BAD_REQUEST)

        console.log(query.email)

        return { valid: !this.service.find(query.email) }
    }

    @Get(":id")
    async getUserById(@Param() params: UserParams) {
        console.log(params)
        return this.service.find(params.id)
    }
}
