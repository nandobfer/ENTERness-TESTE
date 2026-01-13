import { Module } from "@nestjs/common"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { JwtModule } from "@nestjs/jwt"

@Module({
    imports: [JwtModule.register({ secret: "1!Chave!Super!Dificil!", global: true, signOptions: { expiresIn: "60s" } })],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
