import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { ChatsModule } from './chats/chats.module';
import { UsersModule } from './users/users.module';
import { EventsGateway } from './events/events.gateway';

@Module({
    controllers: [AppController],
    providers: [AppService, EventsGateway],
    imports: [ChatsModule, UsersModule],
})
export class AppModule {}
