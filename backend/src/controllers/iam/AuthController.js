"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const BaseController_1 = require("../BaseController");
class AuthController extends BaseController_1.BaseController {
    constructor() {
        super(...arguments);
        this.login = (req, res) => {
            // Mock login returning JSON
            const mockUser = {
                id: 'usr_123',
                email: 'client@example.com',
                role: 'CLIENT',
                token: 'jwt_mock_token_abc123'
            };
            this.sendSuccess(res, mockUser, 'Login successful');
        };
    }
}
exports.AuthController = AuthController;
