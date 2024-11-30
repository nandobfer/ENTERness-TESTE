import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { ChatsModule } from './chats/chats.module';
import { UsersModule } from "./users/users.module"
import { EventsModule } from "./events/events.module"
import { EventEmitterModule } from "@nestjs/event-emitter"

@Module({
    controllers: [AppController],
    providers: [AppService],
    imports: [EventEmitterModule.forRoot(), ChatsModule, UsersModule, EventsModule],
})
export class AppModule {}
