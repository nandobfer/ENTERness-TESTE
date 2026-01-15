import { Test, TestingModule } from "@nestjs/testing"
import { RoomsController } from "./rooms.controller"
import { RoomsService } from "./rooms.service"
import { AuthGuard } from "../auth/auth.guard"

describe("RoomsController", () => {
    let controller: RoomsController
    let service: RoomsService

    const mockRoomsService = {
        getAll: jest.fn(),
        find: jest.fn(),
        countConnectedUsers: jest.fn(),
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
        it("should return all rooms as DTOs", async () => {
            // Arrange
            const mockRoomDto1 = { id: "1", name: "Room 1", users: [], lastMessage: null, createdAt: new Date(), isPrivate: false }
            const mockRoomDto2 = { id: "2", name: "Room 2", users: [], lastMessage: null, createdAt: new Date(), isPrivate: true }
            const mockRooms = [
                { id: "1", name: "Room 1", getDto: jest.fn().mockResolvedValue(mockRoomDto1) },
                { id: "2", name: "Room 2", getDto: jest.fn().mockResolvedValue(mockRoomDto2) },
            ]
            mockRoomsService.getAll.mockResolvedValue(mockRooms)

            // Act
            const result = await controller.getAll()

            // Assert
            expect(result).toEqual([mockRoomDto1, mockRoomDto2])
            expect(service.getAll).toHaveBeenCalled()
            expect(mockRooms[0].getDto).toHaveBeenCalled()
            expect(mockRooms[1].getDto).toHaveBeenCalled()
        })
    })

    describe("GET /rooms/:id/online-count", () => {
        it("should return the count of connected users", async () => {
            // Arrange
            const roomId = "room-123"
            mockRoomsService.countConnectedUsers.mockReturnValue(5)

            // Act
            const result = await controller.countConnectedUsers(roomId)

            // Assert
            expect(result).toBe(5)
            expect(service.countConnectedUsers).toHaveBeenCalledWith(roomId)
        })

        it("should return 0 if no users connected", async () => {
            // Arrange
            const roomId = "empty-room"
            mockRoomsService.countConnectedUsers.mockReturnValue(0)

            // Act
            const result = await controller.countConnectedUsers(roomId)

            // Assert
            expect(result).toBe(0)
        })
    })

    describe("GET /rooms/:id/messages", () => {
        it("should return messages for a room", async () => {
            // Arrange
            const roomId = "room-123"
            const mockMessageDto1 = { id: "msg-1", content: "Hello", roomId, createdAt: new Date(), author: { id: "user-1", email: "a@b.com" } }
            const mockMessageDto2 = { id: "msg-2", content: "Hi!", roomId, createdAt: new Date(), author: { id: "user-2", email: "c@d.com" } }
            const mockMessages = [{ getDto: jest.fn().mockReturnValue(mockMessageDto1) }, { getDto: jest.fn().mockReturnValue(mockMessageDto2) }]
            const mockRoom = {
                getMessages: jest.fn().mockResolvedValue(mockMessages),
            }
            mockRoomsService.find.mockResolvedValue(mockRoom)

            // Act
            const result = await controller.getMessages(roomId)

            // Assert
            expect(result).toEqual([mockMessageDto1, mockMessageDto2])
            expect(service.find).toHaveBeenCalledWith(roomId)
            expect(mockRoom.getMessages).toHaveBeenCalled()
        })
    })
})
