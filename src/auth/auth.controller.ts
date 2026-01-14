import { Body, Controller, Post } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { UserFormDto } from "../users/users.entity"

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("login")
    async signIn(@Body() data: UserFormDto) {
        return this.authService.signIn(data.email, data.password)
    }

    @Post("refresh")
    async refreshToken(@Body("refresh_token") refresh_token: string) {
        return this.authService.refreshToken(refresh_token)
    }
}
