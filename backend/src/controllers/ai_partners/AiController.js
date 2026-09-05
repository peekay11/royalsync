"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const BaseController_1 = require("../BaseController");
class AiController extends BaseController_1.BaseController {
    constructor() {
        super(...arguments);
        this.askQuestion = (req, res) => {
            const mockResponse = {
                answer: 'Your net worth is R1,200,000.',
                citations: ['ClientFinancials']
            };
            this.sendSuccess(res, mockResponse, 'AI response generated');
        };
    }
}
exports.AiController = AiController;
