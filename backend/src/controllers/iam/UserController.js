"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const BaseController_1 = require("../BaseController");
class UserController extends BaseController_1.BaseController {
    constructor() {
        super(...arguments);
        this.getUsers = (req, res) => {
            const mockUsers = [
                { id: 'usr_1', email: 'adviser1@example.com', role: 'ADVISER' },
                { id: 'usr_2', email: 'admin@example.com', role: 'SUPER_ADMIN' }
            ];
            this.sendSuccess(res, mockUsers, 'Users retrieved');
        };
    }
}
exports.UserController = UserController;
