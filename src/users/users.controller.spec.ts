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

    describe("POST /users", () => {
        it("should create a new user", async () => {
            // Arrange
            const userData = { email: "new@example.com", password: "password123" }
            const mockUser = { id: "123", email: "new@example.com" }
            mockUsersService.new.mockResolvedValue(mockUser)

            // Act
            const result = await controller.createUser(userData)

            // Assert
            expect(result).toEqual(true)
            expect(service.new).toHaveBeenCalledWith(userData)
        })
    })
})
