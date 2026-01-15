import { Test, TestingModule } from "@nestjs/testing"
import { RoomsService } from "./rooms.service"
import { Room } from "./rooms.entity"
import { EventsGateway } from "../events/events.gateway"
import { UsersService } from "../users/users.service"
import { EventEmitter2 } from "@nestjs/event-emitter"

jest.mock("./rooms.entity")

describe("RoomsService", () => {
    let service: RoomsService

    const mockEventsGateway = {
        server: {
            emit: jest.fn(),
            to: jest.fn().mockReturnThis(),
            sockets: {
                adapter: {
                    rooms: new Map(),
                },
            },
        },
    }

    const mockUsersService = {
        find: jest.fn(),
    }

    const mockEventEmitter = {
        emit: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoomsService,
                { provide: EventsGateway, useValue: mockEventsGateway },
                { provide: UsersService, useValue: mockUsersService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
            ],
        }).compile()

        service = module.get<RoomsService>(RoomsService)

        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })

    describe("find", () => {
        it("should return room with users relation", async () => {
            // Arrange
            const mockRoom = {
                id: "room-123",
                name: "Test Room",
                users: [{ id: "user-1" }],
            }
            ;(Room.findOne as jest.Mock).mockResolvedValue(mockRoom)

            // Act
            const result = await service.find("room-123")

            // Assert
            expect(result).toEqual(mockRoom)
            expect(Room.findOne).toHaveBeenCalledWith({
                where: { id: "room-123" },
                relations: { users: true },
            })
        })

        it("should return null when room not found", async () => {
            // Arrange
            ;(Room.findOne as jest.Mock).mockResolvedValue(null)

            // Act
            const result = await service.find("nonexistent")

            // Assert
            expect(result).toBeNull()
        })
    })

    describe("getAll", () => {
        it("should return all rooms with users", async () => {
            // Arrange
            const mockRooms = [
                { id: "1", name: "Room 1", users: [] },
                { id: "2", name: "Room 2", users: [] },
            ]
            ;(Room.find as jest.Mock).mockResolvedValue(mockRooms)

            // Act
            const result = await service.getAll()

            // Assert
            expect(result).toEqual(mockRooms)
            expect(Room.find).toHaveBeenCalledWith({ relations: { users: true } })
        })
    })
})
