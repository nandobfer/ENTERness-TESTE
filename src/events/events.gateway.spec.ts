import { Test, TestingModule } from "@nestjs/testing"
import { EventsGateway } from "./events.gateway"
import { UsersService } from "../users/users.service"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { JwtService } from "@nestjs/jwt"

describe("EventsGateway", () => {
    let gateway: EventsGateway

    const mockUsersService = {
        online_users: [],
        onSocketConnect: jest.fn(),
    }

    const mockEventEmitter = {
        emitAsync: jest.fn().mockResolvedValue([{}]),
    }

    const mockJwtService = {
        verify: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventsGateway,
                { provide: UsersService, useValue: mockUsersService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile()

        gateway = module.get<EventsGateway>(EventsGateway)
        gateway.server = {
            emit: jest.fn(),
            sockets: {
                adapter: {
                    rooms: new Map(),
                },
            },
        } as any

        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(gateway).toBeDefined()
    })

    describe("handleConnection", () => {
        it("should authenticate user and setup socket data", () => {
            // Arrange
            const mockSocket = {
                id: "socket-123",
                handshake: { auth: { token: "valid-token" } },
                emit: jest.fn(),
                disconnect: jest.fn(),
                data: {} as { user?: any; rooms?: Set<string> },
            }
            const mockUser = { id: "user-1", email: "test@example.com" }
            mockJwtService.verify.mockReturnValue({ user: mockUser })

            // Act
            gateway.handleConnection(mockSocket as any)

            // Assert
            expect(mockJwtService.verify).toHaveBeenCalledWith("valid-token")
            expect(mockSocket.data.user).toEqual(mockUser)
            expect(mockSocket.data.rooms).toBeInstanceOf(Set)
            expect(mockUsersService.onSocketConnect).toHaveBeenCalledWith(mockSocket, mockUser)
        })

        it("should disconnect if no token provided", () => {
            // Arrange
            const mockSocket = {
                handshake: { auth: {} },
                emit: jest.fn(),
                disconnect: jest.fn(),
            }

            // Act
            gateway.handleConnection(mockSocket as any)

            // Assert
            expect(mockSocket.emit).toHaveBeenCalledWith("error", "Unauthorized: No token provided")
            expect(mockSocket.disconnect).toHaveBeenCalled()
        })

        it("should disconnect if token is invalid", () => {
            // Arrange
            const mockSocket = {
                handshake: { auth: { token: "invalid-token" } },
                emit: jest.fn(),
                disconnect: jest.fn(),
            }
            mockJwtService.verify.mockImplementation(() => {
                throw new Error("Invalid token")
            })

            // Act
            gateway.handleConnection(mockSocket as any)

            // Assert
            expect(mockSocket.emit).toHaveBeenCalledWith("error", "Unauthorized: Invalid token")
            expect(mockSocket.disconnect).toHaveBeenCalled()
        })
    })

    describe("handleDisconnect", () => {
        it("should emit online count for all rooms the user was in", () => {
            // Arrange
            const userRooms = new Set(["room-1", "room-2"])
            const mockSocket = {
                id: "socket-123",
                data: {
                    user: { email: "test@example.com" },
                    rooms: userRooms,
                },
            }

            // Act
            gateway.handleDisconnect(mockSocket as any)

            // Assert
            expect(gateway.server.emit).toHaveBeenCalledWith("room:room-1:online", 0)
            expect(gateway.server.emit).toHaveBeenCalledWith("room:room-2:online", 0)
        })
    })

    describe("handleChatNew", () => {
        it("should emit room:new event and return result", async () => {
            // Arrange
            const mockSocket = { id: "socket-123" }
            const data = { name: "New Room", user_id: "user-1" }
            const expectedResult = { room: { id: "room-1", name: "New Room" } }
            mockEventEmitter.emitAsync.mockResolvedValue([expectedResult])

            // Act
            const result = await gateway.handleChatNew(mockSocket as any, data as any)

            // Assert
            expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith("room:new", mockSocket, data)
            expect(result).toEqual(expectedResult)
        })
    })

    describe("handleChatJoin", () => {
        it("should emit room:join event and return result", async () => {
            // Arrange
            const mockSocket = { id: "socket-123" }
            const data = { room_id: "room-1", user_id: "user-1" }
            const expectedResult = { room: { id: "room-1" } }
            mockEventEmitter.emitAsync.mockResolvedValue([expectedResult])

            // Act
            const result = await gateway.handleChatJoin(mockSocket as any, data as any)

            // Assert
            expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith("room:join", mockSocket, data)
            expect(result).toEqual(expectedResult)
        })
    })

    describe("handleChatLeave", () => {
        it("should emit room:leave event and return result", async () => {
            // Arrange
            const mockSocket = { id: "socket-123" }
            const data = { room_id: "room-1", user_id: "user-1" }
            const expectedResult = { room: { id: "room-1" } }
            mockEventEmitter.emitAsync.mockResolvedValue([expectedResult])

            // Act
            const result = await gateway.handleChatLeave(mockSocket as any, data as any)

            // Assert
            expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith("room:leave", mockSocket, data)
            expect(result).toEqual(expectedResult)
        })
    })

    describe("handleChatMessage", () => {
        it("should emit room:message event and return result", async () => {
            // Arrange
            const mockSocket = { id: "socket-123" }
            const data = { roomId: "room-1", content: "Hello!", authorId: "user-1" }
            const expectedResult = { message: { id: "msg-1", content: "Hello!" } }
            mockEventEmitter.emitAsync.mockResolvedValue([expectedResult])

            // Act
            const result = await gateway.handleChatMessage(mockSocket as any, data as any)

            // Assert
            expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith("room:message", mockSocket, data)
            expect(result).toEqual(expectedResult)
        })
    })

    describe("handleEmitOnlineUsersInRoom", () => {
        it("should emit room online count", () => {
            // Arrange
            const roomId = "room-123"
            const mockRoom = new Set(["socket-1", "socket-2"])
            gateway.server.sockets.adapter.rooms.set(roomId, mockRoom)

            // Act
            gateway.handleEmitOnlineUsersInRoom(roomId)

            // Assert
            expect(gateway.server.emit).toHaveBeenCalledWith(`room:${roomId}:online`, 2)
        })

        it("should emit 0 if room does not exist", () => {
            // Arrange
            const roomId = "non-existent-room"

            // Act
            gateway.handleEmitOnlineUsersInRoom(roomId)

            // Assert
            expect(gateway.server.emit).toHaveBeenCalledWith(`room:${roomId}:online`, 0)
        })
    })
})
