import { UsersService } from "./users.service";
export declare class UsersController {
    private service;
    constructor(service: UsersService);
    getAll(): import("../class/User").User[];
}
