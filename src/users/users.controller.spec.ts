import { Test, TestingModule } from "@nestjs/testing"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"
import { HttpException } from "@nestjs/common"

describe("UsersController", () => {
    let controller: UsersController
    let service: UsersService

    const mockUsersService = {
        getAll: jest.fn(),
        getOnline: jest.fn(),
        new: jest.fn(),
        find: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [{ provide: UsersService, useValue: mockUsersService }],
        }).compile()

        controller = module.get<UsersController>(UsersController)
        service = module.get<UsersService>(UsersService)

        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(controller).toBeDefined()
    })

    describe("GET /users", () => {
        it("should return all users", async () => {
            // Arrange
            const mockUsers = [
                { id: "1", email: "user1@example.com" },
                { id: "2", email: "user2@example.com" },
            ]
            mockUsersService.getAll.mockResolvedValue(mockUsers)

            // Act
            const result = await controller.getAll()

            // Assert
            expect(result).toEqual(mockUsers)
            expect(service.getAll).toHaveBeenCalled()
        })
    })

    describe("GET /users/online", () => {
        it("should return online users", () => {
            // Arrange
            const mockOnlineUsers = [{ id: "1", email: "online@example.com" }]
            mockUsersService.getOnline.mockReturnValue(mockOnlineUsers)

            // Act
            const result = controller.getOnlineUsers()

            // Assert
            expect(result).toEqual(mockOnlineUsers)
            expect(service.getOnline).toHaveBeenCalled()
        })
    })

    describe("POST /users", () => {
        it("should create a new user", async () => {
            // Arrange
            const userData = { email: "new@example.com", password: "password123" }
            const mockUser = { id: "123", email: "new@example.com" }
            mockUsersService.new.mockResolvedValue(mockUser)

            // Act
            const result = await controller.createUser(userData)

            // Assert
            expect(result).toEqual(mockUser)
            expect(service.new).toHaveBeenCalledWith(userData)
        })
    })

    describe("GET /users/email", () => {
        it("should return valid: true when email not found", () => {
            // Arrange
            mockUsersService.find.mockReturnValue(null)

            // Act
            const result = controller.checkEmail({ email: "new@example.com" })

            // Assert
            expect(result).toEqual({ valid: true })
        })

        it("should return valid: false when email exists", () => {
            // Arrange
            mockUsersService.find.mockReturnValue({ id: "123", email: "existing@example.com" })

            // Act
            const result = controller.checkEmail({ email: "existing@example.com" })

            // Assert
            expect(result).toEqual({ valid: false })
        })

        it("should throw HttpException when email param is missing", () => {
            // Act & Assert
            expect(() => controller.checkEmail({ email: "" })).toThrow(HttpException)
        })
    })

    describe("GET /users/:id", () => {
        it("should return user by id", async () => {
            // Arrange
            const mockUser = { id: "123", email: "user@example.com" }
            mockUsersService.find.mockResolvedValue(mockUser)

            // Act
            const result = await controller.getUserById({ id: "123" })

            // Assert
            expect(result).toEqual(mockUser)
            expect(service.find).toHaveBeenCalledWith("123")
        })
    })
})
