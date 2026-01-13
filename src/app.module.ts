import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { UsersModule } from "./users/users.module"
import { EventsModule } from "./events/events.module"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { RoomsModule } from "./rooms/rooms.module"
import { DatabaseModule } from "./db/database.module"
import { MessagesModule } from "./messages/messages.module"
import { ConfigModule } from "@nestjs/config"
import { AuthModule } from './auth/auth.module';

@Module({
    controllers: [AppController],
    providers: [AppService],
    imports: [DatabaseModule, EventEmitterModule.forRoot(), UsersModule, EventsModule, RoomsModule, MessagesModule, ConfigModule.forRoot(), AuthModule],
})
export class AppModule {}
