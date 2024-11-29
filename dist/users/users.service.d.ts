import { User, UserForm } from "src/class/User";
export declare class UsersService {
    private readonly users;
    new(data: UserForm): User;
    getAll(): User[];
    findById(id: string): User;
}
