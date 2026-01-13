import { Test, TestingModule } from "@nestjs/testing"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { UnauthorizedException } from "@nestjs/common"

describe("AuthController", () => {
    let controller: AuthController
    let authService: AuthService

    const mockAuthService = {
        signIn: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: mockAuthService }],
        }).compile()

        controller = module.get<AuthController>(AuthController)
        authService = module.get<AuthService>(AuthService)

        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(controller).toBeDefined()
    })

    describe("POST /auth/login", () => {
        it("should return access_token on successful login", async () => {
            // Arrange
            const loginDto = { email: "test@example.com", password: "password123" }
            const expectedResult = { access_token: "jwt-token" }
            mockAuthService.signIn.mockResolvedValue(expectedResult)

            // Act
            const result = await controller.signIn(loginDto)

            // Assert
            expect(result).toEqual(expectedResult)
            expect(authService.signIn).toHaveBeenCalledWith("test@example.com", "password123")
        })

        it("should throw UnauthorizedException on invalid credentials", async () => {
            // Arrange
            const loginDto = { email: "test@example.com", password: "wrongpassword" }
            mockAuthService.signIn.mockRejectedValue(new UnauthorizedException())

            // Act & Assert
            await expect(controller.signIn(loginDto)).rejects.toThrow(UnauthorizedException)
        })
    })
})
