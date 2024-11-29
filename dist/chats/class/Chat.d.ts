import { WithoutFunctions } from "src/helpers";
import { Message } from "./Message";
import { User } from "./User";
export declare class ChatForm {
    owner_id: string;
    name: string;
    password?: string;
}
export declare class Chat {
    id: string;
    name: string;
    messages: Message[];
    owner: User;
    users: User[];
    password?: string;
    constructor(data: WithoutFunctions<Chat>);
}
