import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { User, UserDto } from "../users/users.entity"

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {}

    async generateTokens(user: UserDto) {
        return {
            access_token: await this.jwtService.signAsync<{ user: UserDto }>({ user }, { expiresIn: "5m" }),
            refresh_token: await this.jwtService.signAsync<{ user: UserDto }>({ user }, { expiresIn: "1h" }),
        }
    }

    async signIn(email: string, password: string) {
        const user = await User.findOne({ where: { email: email.toLowerCase().trim() } })

        if (user) {
            const validPassword = await user.validatePassword(password.trim())
            if (validPassword) {
                const payload = user.getDto()

                return await this.generateTokens(payload)
            }
        }

        throw new UnauthorizedException("usuário ou senha inválidos")
    }

    async refreshToken(refresh_token: string) {
        try {
            const payload = this.jwtService.verify<{ user: UserDto }>(refresh_token)
            const user = payload.user

            return await this.generateTokens(user)
        } catch (error) {
            throw new UnauthorizedException("Invalid refresh token")
        }
    }
}
