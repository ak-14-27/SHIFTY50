"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../shared/db/prisma");
const enums_1 = require("../../shared/types/enums");
const INITIAL_VIRTUAL_CAPITAL = 100000.0; // ₹1,00,000
class AuthService {
    /**
     * Registers a new user with status REGISTERED
     */
    static async register(input) {
        const existing = await prisma_1.prisma.user.findUnique({
            where: { email: input.email.toLowerCase() },
        });
        if (existing) {
            throw { status: 409, message: 'An account with this email already exists' };
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(input.password, salt);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: input.email.toLowerCase(),
                passwordHash,
                fullName: input.fullName,
                kycStatus: enums_1.KycStatus.REGISTERED,
                role: enums_1.UserRole.USER,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                kycStatus: true,
                role: true,
                createdAt: true,
            },
        });
        const token = this.generateToken(user.id);
        return { user, token };
    }
    /**
     * Logs in an existing user
     */
    static async login(input) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: input.email.toLowerCase() },
            include: {
                wallet: true,
            },
        });
        if (!user) {
            throw { status: 401, message: 'Invalid email or password' };
        }
        const isMatch = await bcryptjs_1.default.compare(input.password, user.passwordHash);
        if (!isMatch) {
            throw { status: 401, message: 'Invalid email or password' };
        }
        const token = this.generateToken(user.id);
        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                kycStatus: user.kycStatus,
                role: user.role,
                createdAt: user.createdAt,
                wallet: user.wallet,
            },
            token,
        };
    }
    /**
     * Handles mock KYC submission and automatically transitions
     * REGISTERED -> VERIFICATION_PENDING -> VERIFIED -> ACTIVE
     * (Simulating realistic fintech verification flow with immediate activation)
     */
    static async submitKyc(userId, input, autoActivate = true) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { wallet: true },
        });
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }
        if (user.kycStatus === enums_1.KycStatus.ACTIVE) {
            throw { status: 400, message: 'KYC is already completed and active' };
        }
        // Step 1: Update to VERIFICATION_PENDING with submitted credentials
        let updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                panMock: input.panNumber,
                aadhaarMock: input.aadhaarNumber,
                kycStatus: enums_1.KycStatus.VERIFICATION_PENDING,
            },
        });
        // Step 2: In our simulation lab mode, advance to ACTIVE and initialize wallet
        if (autoActivate) {
            return await this.activateUserAndSeedWallet(userId);
        }
        return updatedUser;
    }
    /**
     * Activates user and creates their virtual ₹1,00,000 ledger-backed wallet inside an ACID transaction
     */
    static async activateUserAndSeedWallet(userId) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            // Transition status to ACTIVE
            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    kycStatus: enums_1.KycStatus.ACTIVE,
                },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    kycStatus: true,
                    role: true,
                    panMock: true,
                    aadhaarMock: true,
                },
            });
            // Check if wallet exists
            let wallet = await tx.wallet.findUnique({
                where: { userId },
            });
            if (!wallet) {
                // Create initial ₹1,00,000 wallet
                wallet = await tx.wallet.create({
                    data: {
                        userId,
                        availableBalance: INITIAL_VIRTUAL_CAPITAL,
                        reservedBalance: 0.0,
                        investedBalance: 0.0,
                        currency: 'INR',
                    },
                });
                // Record initial immutable double-entry ledger record
                await tx.walletLedger.create({
                    data: {
                        walletId: wallet.id,
                        transactionType: enums_1.TransactionType.MONTHLY_CREDIT,
                        amount: INITIAL_VIRTUAL_CAPITAL,
                        balanceBefore: 0.0,
                        balanceAfter: INITIAL_VIRTUAL_CAPITAL,
                        referenceId: `KYC_INIT_${Date.now()}`,
                        description: `Initial Monthly Virtual Capital Allocation (₹${INITIAL_VIRTUAL_CAPITAL.toLocaleString('en-IN')})`,
                    },
                });
            }
            return {
                user,
                wallet,
            };
        });
    }
    /**
     * Helper to generate signed JWT token
     */
    static generateToken(userId) {
        const secret = process.env.JWT_SECRET || 'shifty50_super_secure_jwt_secret_change_in_production_2026';
        const expiresIn = (process.env.JWT_EXPIRES_IN || '7d');
        return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map