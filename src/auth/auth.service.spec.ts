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
        verify: jest.fn(),
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

    describe("generateTokens", () => {
        it("should generate access and refresh tokens", async () => {
            // Arrange
            const userDto = { id: "123", email: "test@example.com", username: 'test' }
            mockJwtService.signAsync.mockResolvedValueOnce("access-token").mockResolvedValueOnce("refresh-token")

            // Act
            const result = await service.generateTokens(userDto)

            // Assert
            expect(result).toEqual({
                access_token: "access-token",
                refresh_token: "refresh-token",
            })
            expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2)
            expect(mockJwtService.signAsync).toHaveBeenCalledWith({ user: userDto }, { expiresIn: "5m" })
            expect(mockJwtService.signAsync).toHaveBeenCalledWith({ user: userDto }, { expiresIn: "1h" })
        })
    })

    describe("signIn", () => {
        it("should return tokens when credentials are valid", async () => {
            // Arrange: mock User.findOne to return a valid user
            const mockUser = {
                id: "123",
                email: "test@example.com",
                validatePassword: jest.fn().mockResolvedValue(true),
                getDto: jest.fn().mockReturnValue({ id: "123", email: "test@example.com" }),
            }
            ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)
            mockJwtService.signAsync.mockResolvedValueOnce("access-token").mockResolvedValueOnce("refresh-token")

            // Act
            const result = await service.signIn("test@example.com", "password123")

            // Assert
            expect(result).toEqual({
                access_token: "access-token",
                refresh_token: "refresh-token",
            })
            expect(mockUser.validatePassword).toHaveBeenCalledWith("password123")
        })

        it("should trim and lowercase email", async () => {
            // Arrange
            const mockUser = {
                validatePassword: jest.fn().mockResolvedValue(true),
                getDto: jest.fn().mockReturnValue({ id: "123", email: "test@example.com" }),
            }
            ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)

            // Act
            await service.signIn("  TEST@EXAMPLE.COM  ", "  password  ")

            // Assert
            expect(User.findOne).toHaveBeenCalledWith({ where: { email: "test@example.com" } })
            expect(mockUser.validatePassword).toHaveBeenCalledWith("password")
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

    describe("refreshToken", () => {
        it("should return new tokens when refresh token is valid", async () => {
            // Arrange
            const userDto = { id: "123", email: "test@example.com" }
            mockJwtService.verify.mockReturnValue({ user: userDto })
            mockJwtService.signAsync.mockResolvedValueOnce("new-access-token").mockResolvedValueOnce("new-refresh-token")

            // Act
            const result = await service.refreshToken("valid-refresh-token")

            // Assert
            expect(result).toEqual({
                access_token: "new-access-token",
                refresh_token: "new-refresh-token",
            })
            expect(mockJwtService.verify).toHaveBeenCalledWith("valid-refresh-token")
        })

        it("should throw UnauthorizedException when refresh token is invalid", async () => {
            // Arrange
            mockJwtService.verify.mockImplementation(() => {
                throw new Error("Invalid token")
            })

            // Act & Assert
            await expect(service.refreshToken("invalid-token")).rejects.toThrow(UnauthorizedException)
        })
    })
})
