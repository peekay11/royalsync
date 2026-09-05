"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const BaseController_1 = require("../BaseController");
class ApplicationController extends BaseController_1.BaseController {
    constructor() {
        super(...arguments);
        this.getApplications = (req, res) => {
            const mockApps = [
                { id: 'app_1', client: 'John Doe', status: 'ready_to_quote', productType: 'Motor' }
            ];
            this.sendSuccess(res, mockApps, 'Applications retrieved');
        };
    }
}
exports.ApplicationController = ApplicationController;
