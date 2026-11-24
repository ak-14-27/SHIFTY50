"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const auth_validation_1 = require("./auth.validation");
const response_1 = require("../../shared/utils/response");
class AuthController {
    static async register(req, res, next) {
        try {
            const validated = auth_validation_1.registerSchema.parse(req.body);
            const result = await auth_service_1.AuthService.register(validated);
            return (0, response_1.sendSuccess)(res, result, 'User registered successfully. Please proceed with KYC.', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const validated = auth_validation_1.loginSchema.parse(req.body);
            const result = await auth_service_1.AuthService.login(validated);
            return (0, response_1.sendSuccess)(res, result, 'Logged in successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async submitKyc(req, res, next) {
        try {
            const validated = auth_validation_1.kycSubmitSchema.parse(req.body);
            const userId = req.user.id;
            const result = await auth_service_1.AuthService.submitKyc(userId, validated, true);
            return (0, response_1.sendSuccess)(res, result, 'KYC verified successfully! Your virtual trading wallet has been activated with ₹1,00,000 capital.');
        }
        catch (error) {
            next(error);
        }
    }
    static async getMe(req, res, next) {
        try {
            return (0, response_1.sendSuccess)(res, { user: req.user }, 'User profile retrieved');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map