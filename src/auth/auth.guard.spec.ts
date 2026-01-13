import { Test, TestingModule } from "@nestjs/testing"
import { AuthGuard } from "./auth.guard"
import { JwtService } from "@nestjs/jwt"
import { ExecutionContext, UnauthorizedException } from "@nestjs/common"

describe("AuthGuard", () => {
    let guard: AuthGuard
    let jwtService: JwtService

    const mockJwtService = {
        verify: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthGuard, { provide: JwtService, useValue: mockJwtService }],
        }).compile()

        guard = module.get<AuthGuard>(AuthGuard)
        jwtService = module.get<JwtService>(JwtService)

        jest.clearAllMocks()
    })

    // Helper to create mock ExecutionContext
    const createMockContext = (authHeader?: string): ExecutionContext => {
        const mockRequest = {
            headers: {
                authorization: authHeader,
            },
            user: null,
        }

        return {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
            }),
        } as ExecutionContext
    }

    it("should be defined", () => {
        expect(guard).toBeDefined()
    })

    describe("canActivate", () => {
        it("should return true and set user when token is valid", () => {
            // Arrange
            const mockPayload = { id: "123", email: "test@example.com" }
            mockJwtService.verify.mockReturnValue(mockPayload)
            const context = createMockContext("Bearer valid-token")

            // Act
            const result = guard.canActivate(context)

            // Assert
            expect(result).toBe(true)
            expect(jwtService.verify).toHaveBeenCalledWith("valid-token")
            expect(context.switchToHttp().getRequest().user).toEqual(mockPayload)
        })

        it("should throw UnauthorizedException when no token provided", () => {
            // Arrange
            const context = createMockContext(undefined)

            // Act & Assert
            expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
        })

        it("should throw UnauthorizedException when authorization header is malformed", () => {
            // Arrange
            const context = createMockContext("InvalidHeader")

            // Act & Assert
            expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
        })

        it("should throw UnauthorizedException when token type is not Bearer", () => {
            // Arrange
            const context = createMockContext("Basic some-token")

            // Act & Assert
            expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
        })

        it("should throw UnauthorizedException when token verification fails", () => {
            // Arrange
            mockJwtService.verify.mockImplementation(() => {
                throw new Error("Invalid token")
            })
            const context = createMockContext("Bearer invalid-token")

            // Act & Assert
            expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
        })
    })
})
