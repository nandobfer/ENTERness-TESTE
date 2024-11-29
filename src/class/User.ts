import { WithoutFunctions } from "src/helpers"

export type UserStatus = "available" | "idle"

export class UserForm {
    username: string
}

export class User {
    id: string
    username: string
    status: UserStatus

    constructor(data: WithoutFunctions<User>) {
        this.id = data.id
        this.username = data.username
        this.status = data.status
    }
}
