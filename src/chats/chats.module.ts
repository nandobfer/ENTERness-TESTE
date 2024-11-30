import { Module } from "@nestjs/common"
import { ChatsController } from "./chats.controller"
import { ChatsService } from "./chats.service"
import { UsersModule } from "src/users/users.module"
import { EventsModule } from "src/events/events.module"

@Module({
    controllers: [ChatsController],
    providers: [ChatsService],
    imports: [UsersModule, EventsModule],
})
export class ChatsModule {}
