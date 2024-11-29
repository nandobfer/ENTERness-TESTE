"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatsService = void 0;
const common_1 = require("@nestjs/common");
const Chat_1 = require("../class/Chat");
const crypto_1 = require("crypto");
const users_service_1 = require("../users/users.service");
let ChatsService = class ChatsService {
    constructor(usersService) {
        this.chats = [];
        this.usersService = usersService;
    }
    new(data) {
        const owner = this.usersService.findById(data.owner_id);
        if (!owner)
            throw new common_1.HttpException("Usuário não encontrado", common_1.HttpStatus.NOT_FOUND);
        const chat = new Chat_1.Chat({ id: (0, crypto_1.randomUUID)(), name: data.name, password: data.password, owner, messages: [], users: [] });
        return chat;
    }
    getAll() {
        return this.chats;
    }
};
exports.ChatsService = ChatsService;
exports.ChatsService = ChatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], ChatsService);
//# sourceMappingURL=chats.service.js.map