import { Chat, ChatForm } from "../class/Chat";
import { UsersService } from "src/users/users.service";
export declare class ChatsService {
    private readonly usersService;
    private readonly chats;
    constructor(usersService: UsersService);
    new(data: ChatForm): Chat;
    getAll(): Chat[];
}
