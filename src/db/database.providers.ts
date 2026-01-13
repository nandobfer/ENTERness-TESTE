import { ConfigService } from "@nestjs/config"
import { config } from "dotenv"
import { DataSource } from "typeorm"

config({ debug: true })

const dataSource = new DataSource({
    type: "mariadb",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + "/../**/*.entity{.ts,.js}"],

    // migrations
    synchronize: false,
    migrations: [__dirname + "/migration/**/*{.js,.ts}"],

    migrationsRun: false,
    migrationsTableName: "migrations",
    migrationsTransactionMode: "all",
})

export const databaseProviders = [
    {
        provide: "DATA_SOURCE",
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
            return dataSource.initialize()
        },
    },
]

export default dataSource