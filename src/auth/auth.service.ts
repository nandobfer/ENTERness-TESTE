import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { User } from "../users/users.entity"

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {}

    async signIn(email: string, password: string) {
        const user = await User.findOne({ where: { email: email.toLowerCase().trim() } })

        if (user) {
            const validPassword = await user.validatePassword(password.trim())
            if (validPassword) {
                const payload = user.getDto()

                return {
                    access_token: await this.jwtService.signAsync(payload),
                }
            }
        }

        throw new UnauthorizedException("usuário ou senha inválidos")
    }

    
}
