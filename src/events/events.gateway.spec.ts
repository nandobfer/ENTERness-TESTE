import { Test, TestingModule } from "@nestjs/testing"
import { EventsGateway } from "./events.gateway"
import { UsersService } from "../users/users.service"
import { EventEmitter2 } from "@nestjs/event-emitter"

describe("EventsGateway", () => {
    let gateway: EventsGateway

    const mockUsersService = {
        online_users: [],
        logout: jest.fn(),
        onLogin: jest.fn(),
    }

    const mockEventEmitter = {
        emit: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EventsGateway, { provide: UsersService, useValue: mockUsersService }, { provide: EventEmitter2, useValue: mockEventEmitter }],
        }).compile()

        gateway = module.get<EventsGateway>(EventsGateway)

        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(gateway).toBeDefined()
    })

    describe("handleDisconnect", () => {
        it("should logout user and emit user:logout event", () => {
            // Arrange
            const mockSocket = { id: "socket-123" }
            const mockUser = {
                id: "user-1",
                socket: mockSocket,
                getDto: jest.fn().mockReturnValue({ id: "user-1", email: "test@example.com" }),
            }
            mockUsersService.online_users = [mockUser]
            gateway.server = { emit: jest.fn() } as any

            // Act
            gateway.handleDisconnect(mockSocket as any)

            // Assert
            expect(mockUsersService.logout).toHaveBeenCalledWith(mockSocket)
            expect(gateway.server.emit).toHaveBeenCalledWith("user:logout", { id: "user-1", email: "test@example.com" })
        })
    })

    describe("handleUserLogin", () => {
        it("should login user and emit user:login event", async () => {
            // Arrange
            const mockSocket = { id: "socket-123" }
            const mockAck = jest.fn()
            const mockUser = {
                getDto: jest.fn().mockReturnValue({ id: "user-1", email: "test@example.com" }),
            }
            mockUsersService.onLogin.mockResolvedValue(mockUser)
            gateway.server = { emit: jest.fn() } as any

            // Act
            await gateway.handleUserLogin(mockSocket as any, "user-1", mockAck)

            // Assert
            expect(mockUsersService.onLogin).toHaveBeenCalledWith(mockSocket, "user-1", mockAck)
            expect(gateway.server.emit).toHaveBeenCalledWith("user:login", { id: "user-1", email: "test@example.com" })
        })
    })

    describe("handleChatJoin", () => {
        it("should emit room:join event", () => {
            // Arrange
            const mockSocket = { id: "socket-123" }
            const data = { room_id: "room-1", user_id: "user-1" }
            const mockAck = jest.fn()

            // Act
            gateway.handleChatJoin(mockSocket as any, data, mockAck)

            // Assert
            expect(mockEventEmitter.emit).toHaveBeenCalledWith("room:join", mockSocket, data, mockAck)
        })
    })

    describe("handleChatLeave", () => {
        it("should emit room:leave event", () => {
            // Arrange
            const mockSocket = { id: "socket-123" }
            const data = { room_id: "room-1", user_id: "user-1" }
            const mockAck = jest.fn()

            // Act
            gateway.handleChatLeave(mockSocket as any, data, mockAck)

            // Assert
            expect(mockEventEmitter.emit).toHaveBeenCalledWith("room:leave", mockSocket, data, mockAck)
        })
    })

    describe("handleChatMessage", () => {
        it("should emit room:message event", () => {
            // Arrange
            const mockSocket = { id: "socket-123" }
            const data = { room_id: "room-1", content: "Hello!" }
            const mockAck = jest.fn()

            // Act
            gateway.handleChatMessage(mockSocket as any, data as any, mockAck)

            // Assert
            expect(mockEventEmitter.emit).toHaveBeenCalledWith("room:message", mockSocket, data, mockAck)
        })
    })
})
