import { Test, TestingModule } from "@nestjs/testing"
import { UsersService } from "./users.service"
import { User } from "./users.entity"
import { EventEmitter2 } from "@nestjs/event-emitter"
import * as bcrypt from "bcrypt"

jest.mock("./users.entity")
jest.mock("bcrypt")

describe("UsersService", () => {
    let service: UsersService

    const mockEventEmitter = {
        emit: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UsersService, { provide: EventEmitter2, useValue: mockEventEmitter }],
        }).compile()

        service = module.get<UsersService>(UsersService)

        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })

    describe("new", () => {
        it("should create a new user with hashed password", async () => {
            // Arrange
            const userData = { email: "Test@Example.com", password: "password123" }
            const hashedPassword = "hashed-password"
            ;(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword)

            const mockUser = {
                id: "123",
                email: "test@example.com",
                password: hashedPassword,
                save: jest.fn().mockResolvedValue(undefined),
            }
            ;(User.create as jest.Mock).mockReturnValue(mockUser)

            // Act
            const result = await service.new(userData)

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10)
            expect(User.create).toHaveBeenCalledWith({
                email: "test@example.com",
                password: hashedPassword,
            })
            expect(mockUser.save).toHaveBeenCalled()
            expect(result).toEqual(mockUser)
        })

        it("should trim and lowercase email", async () => {
            // Arrange
            const userData = { email: "  TEST@EXAMPLE.COM  ", password: "  pass  " }
            ;(bcrypt.hash as jest.Mock).mockResolvedValue("hashed")

            const mockUser = { save: jest.fn() }
            ;(User.create as jest.Mock).mockReturnValue(mockUser)

            // Act
            await service.new(userData)

            // Assert
            expect(User.create).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "hashed",
            })
            expect(bcrypt.hash).toHaveBeenCalledWith("pass", 10)
        })
    })

    describe("login", () => {
        it("should return user when credentials are valid", async () => {
            // Arrange
            const loginData = { email: "test@example.com", password: "password123" }
            const mockUser = {
                id: "123",
                email: "test@example.com",
                validatePassword: jest.fn().mockResolvedValue(true),
            }
            ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)

            // Act
            const result = await service.login(loginData)

            // Assert
            expect(result).toEqual(mockUser)
            expect(mockUser.validatePassword).toHaveBeenCalledWith("password123")
        })

        it("should throw error when password is invalid", async () => {
            // Arrange
            const loginData = { email: "test@example.com", password: "wrongpassword" }
            const mockUser = {
                validatePassword: jest.fn().mockResolvedValue(false),
            }
            ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)

            // Act & Assert
            await expect(service.login(loginData)).rejects.toThrow("Invalid password")
        })

        it("should return undefined when user not found", async () => {
            // Arrange
            ;(User.findOne as jest.Mock).mockResolvedValue(null)

            // Act
            const result = await service.login({ email: "notfound@example.com", password: "pass" })

            // Assert
            expect(result).toBeUndefined()
        })
    })

    describe("find", () => {
        it("should return user from online_users if found", async () => {
            // Arrange
            const mockUser = { id: "123", email: "test@example.com" }
            service.online_users.push(mockUser as any)

            // Act
            const result = await service.find("123")

            // Assert
            expect(result).toEqual(mockUser)
            expect(User.findOne).not.toHaveBeenCalled()
        })

        it("should query database if user not in online_users", async () => {
            // Arrange
            const mockUser = { id: "456", email: "db@example.com" }
            ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)

            // Act
            const result = await service.find("456")

            // Assert
            expect(result).toEqual(mockUser)
            expect(User.findOne).toHaveBeenCalledWith({
                where: [{ id: "456" }, { email: "456" }],
            })
        })
    })

    describe("getAll", () => {
        it("should return all users from database", async () => {
            // Arrange
            const mockUsers = [
                { id: "1", email: "user1@example.com" },
                { id: "2", email: "user2@example.com" },
            ]
            ;(User.find as jest.Mock).mockResolvedValue(mockUsers)

            // Act
            const result = await service.getAll()

            // Assert
            expect(result).toEqual(mockUsers)
            expect(User.find).toHaveBeenCalled()
        })
    })

    describe("getOnline", () => {
        it("should return DTOs of online users", () => {
            // Arrange
            const mockUsers = [
                { id: "1", email: "user1@example.com", getDto: jest.fn().mockReturnValue({ id: "1", email: "user1@example.com" }) },
                { id: "2", email: "user2@example.com", getDto: jest.fn().mockReturnValue({ id: "2", email: "user2@example.com" }) },
            ]
            service.online_users.push(...(mockUsers as any))

            // Act
            const result = service.getOnline()

            // Assert
            expect(result).toEqual([
                { id: "1", email: "user1@example.com" },
                { id: "2", email: "user2@example.com" },
            ])
        })
    })

    describe("logout", () => {
        it("should remove user from online_users by socket id", () => {
            // Arrange
            const mockSocket = { id: "socket-123" }
            const mockUser = { id: "1", socket: mockSocket }
            service.online_users.push(mockUser as any)

            // Act
            service.logout(mockSocket as any)

            // Assert
            expect(service.online_users).toHaveLength(0)
        })

        it("should do nothing if socket not found", () => {
            // Arrange
            const mockSocket = { id: "socket-123" }
            const mockUser = { id: "1", socket: { id: "different-socket" } }
            service.online_users.push(mockUser as any)

            // Act
            service.logout(mockSocket as any)

            // Assert
            expect(service.online_users).toHaveLength(1)
        })
    })

    describe("onLogin", () => {
        it("should add user to online_users and call ack", async () => {
            // Arrange
            const mockSocket = { id: "socket-123" }
            const mockUser = { id: "user-123", email: "test@example.com" }
            const mockAck = jest.fn()
            ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)

            // Act
            const result = await service.onLogin(mockSocket as any, "user-123", mockAck)

            // Assert
            expect(result.socket).toBe(mockSocket)
            expect(service.online_users).toContain(mockUser)
            expect(mockAck).toHaveBeenCalled()
        })
    })
})
