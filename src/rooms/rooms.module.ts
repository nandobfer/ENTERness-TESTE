import { Module } from "@nestjs/common"
import { RoomsService } from "./rooms.service"
import { RoomsController } from "./rooms.controller"
import { UsersModule } from "../users/users.module"
import { EventsModule } from "../events/events.module"

@Module({
    providers: [RoomsService],
    controllers: [RoomsController],
    imports: [UsersModule, EventsModule],
})
export class RoomsModule {}
