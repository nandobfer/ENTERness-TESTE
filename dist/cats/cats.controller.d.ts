import { CatDto } from "./Cat";
import { CatsService } from "./cats.service";
export declare class CatsController {
    private service;
    constructor(service: CatsService);
    findAll(): Promise<import("./Cat").Cat[]>;
    create(catDto: CatDto): Promise<void>;
}
