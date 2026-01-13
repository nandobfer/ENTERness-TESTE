import { Test, TestingModule } from "@nestjs/testing"
import { AuthService } from "./auth.service"
import { JwtService } from "@nestjs/jwt"
import { UnauthorizedException } from "@nestjs/common"
import { User } from "../users/users.entity"

// Mock the User entity's static methods
jest.mock("../users/users.entity")

describe("AuthService", () => {
    let service: AuthService
    let jwtService: JwtService

    // Mock JwtService
    const mockJwtService = {
        signAsync: jest.fn().mockResolvedValue("mock-jwt-token"),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthService, { provide: JwtService, useValue: mockJwtService }],
        }).compile()

        service = module.get<AuthService>(AuthService)
        jwtService = module.get<JwtService>(JwtService)

        // Reset mocks between tests
        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })

    describe("signIn", () => {
        it("should return access_token when credentials are valid", async () => {
            // Arrange: mock User.findOne to return a valid user
            const mockUser = {
                id: "123",
                email: "test@example.com",
                validatePassword: jest.fn().mockResolvedValue(true),
                getDto: jest.fn().mockReturnValue({ id: "123", email: "test@example.com" }),
            }
            ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)

            // Act
            const result = await service.signIn("test@example.com", "password123")

            // Assert
            expect(result).toEqual({ access_token: "mock-jwt-token" })
            expect(mockUser.validatePassword).toHaveBeenCalledWith("password123")
            expect(jwtService.signAsync).toHaveBeenCalledWith({ id: "123", email: "test@example.com" })
        })

        it("should throw UnauthorizedException when user not found", async () => {
            // Arrange: mock User.findOne to return null
            ;(User.findOne as jest.Mock).mockResolvedValue(null)

            // Act & Assert
            await expect(service.signIn("notfound@example.com", "password")).rejects.toThrow(UnauthorizedException)
        })

        it("should throw UnauthorizedException when password is invalid", async () => {
            // Arrange
            const mockUser = {
                validatePassword: jest.fn().mockResolvedValue(false),
            }
            ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)

            // Act & Assert
            await expect(service.signIn("test@example.com", "wrongpassword")).rejects.toThrow(UnauthorizedException)
        })
    })
})
