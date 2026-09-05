"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycController = void 0;
const BaseController_1 = require("../BaseController");
class KycController extends BaseController_1.BaseController {
    constructor() {
        super(...arguments);
        this.getKycStatus = (req, res) => {
            const mockKyc = [
                { id: 'kyc_1', client: 'John Doe', status: 'verified', pepResult: 'clear' }
            ];
            this.sendSuccess(res, mockKyc, 'KYC status retrieved');
        };
    }
}
exports.KycController = KycController;
