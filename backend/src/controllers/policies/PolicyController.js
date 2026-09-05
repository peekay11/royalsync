"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyController = void 0;
const BaseController_1 = require("../BaseController");
const db_1 = require("../../db");
class PolicyController extends BaseController_1.BaseController {
    constructor() {
        super(...arguments);
        this.getPolicies = (req, res) => {
            setTimeout(() => {
                this.sendSuccess(res, db_1.db.policies, 'Policies retrieved');
            }, 1000);
        };
    }
}
exports.PolicyController = PolicyController;
