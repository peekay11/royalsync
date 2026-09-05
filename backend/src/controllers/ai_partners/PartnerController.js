"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerController = void 0;
const BaseController_1 = require("../BaseController");
class PartnerController extends BaseController_1.BaseController {
    constructor() {
        super(...arguments);
        this.getPartnerDashboard = (req, res) => {
            const mockData = {
                totalClients: 124,
                recentMessages: [
                    { id: 1, sender: 'Admin', text: 'Please upload the latest compliance documents.', time: '10:00 AM' }
                ]
            };
            this.sendSuccess(res, mockData, 'Partner data retrieved');
        };
    }
}
exports.PartnerController = PartnerController;
