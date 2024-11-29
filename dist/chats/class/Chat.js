"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = exports.ChatForm = void 0;
class ChatForm {
}
exports.ChatForm = ChatForm;
class Chat {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.messages = data.messages;
        this.owner = data.owner;
        this.users = data.users;
        this.password = data.password;
    }
}
exports.Chat = Chat;
//# sourceMappingURL=Chat.js.map