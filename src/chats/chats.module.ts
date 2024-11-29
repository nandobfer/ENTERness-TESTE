import { Module } from "@nestjs/common"
import { ChatsController } from "./chats.controller"
import { ChatsService } from "./chats.service"
import { UsersModule } from "src/users/users.module"

@Module({
    controllers: [ChatsController],
    providers: [ChatsService],
    imports: [UsersModule],
})
export class ChatsModule {}
