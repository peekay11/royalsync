"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalController = void 0;
const BaseController_1 = require("../BaseController");
class GoalController extends BaseController_1.BaseController {
    constructor() {
        super(...arguments);
        this.getGoals = (req, res) => {
            const mockGoals = [
                { id: 'gol_1', title: 'Retirement', target: 5000000, current: 200000 }
            ];
            this.sendSuccess(res, mockGoals, 'Goals retrieved');
        };
    }
}
exports.GoalController = GoalController;
