import { ChatsService } from "./chats.service";
export declare class ChatsController {
    private service;
    constructor(service: ChatsService);
    getAll(): import("../class/Chat").Chat[];
}
