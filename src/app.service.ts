import { Injectable } from "@nestjs/common"

@Injectable()
export class AppService {
    getVersion() {
        return { version: process.env.npm_package_version }
    }
}
