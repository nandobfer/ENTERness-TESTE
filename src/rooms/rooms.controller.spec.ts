import { Test, TestingModule } from "@nestjs/testing"
import { RoomsController } from "./rooms.controller"
import { RoomsService } from "./rooms.service"
import { AuthGuard } from "../auth/auth.guard"

describe("RoomsController", () => {
    let controller: RoomsController
    let service: RoomsService

    const mockRoomsService = {
        getAll: jest.fn(),
        new: jest.fn(),
    }

    // Mock guard that always allows access
    const mockAuthGuard = { canActivate: jest.fn(() => true) }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RoomsController],
            providers: [{ provide: RoomsService, useValue: mockRoomsService }],
        })
            .overrideGuard(AuthGuard)
            .useValue(mockAuthGuard)
            .compile()

        controller = module.get<RoomsController>(RoomsController)
        service = module.get<RoomsService>(RoomsService)

        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(controller).toBeDefined()
    })

    describe("GET /rooms", () => {
        it("should return all rooms", async () => {
            // Arrange
            const mockRooms = [
                { id: "1", name: "Room 1", users: [] },
                { id: "2", name: "Room 2", users: [] },
            ]
            mockRoomsService.getAll.mockResolvedValue(mockRooms)

            // Act
            const result = await controller.getAll()

            // Assert
            expect(result).toEqual(mockRooms)
            expect(service.getAll).toHaveBeenCalled()
        })
    })

    describe("POST /rooms", () => {
        it("should create a new room", async () => {
            // Arrange
            const roomData = { name: "New Room", password: "secret", user_id: "user-123" }
            const mockRoom = { id: "room-123", name: "New Room", users: [] }
            mockRoomsService.new.mockResolvedValue(mockRoom)

            // Act
            const result = await controller.createRoom(roomData)

            // Assert
            expect(result).toEqual(mockRoom)
            expect(service.new).toHaveBeenCalledWith(roomData)
        })
    })
})
