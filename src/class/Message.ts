import { WithoutFunctions } from "src/helpers"

export class Message {
    id: string
    body: string
    author_id: string

    constructor(data: WithoutFunctions<Message>) {
        this.id = data.id
        this.body = data.body
        this.author_id = data.author_id
    }
}
