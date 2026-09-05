"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimController = void 0;
const BaseController_1 = require("../BaseController");
const db_1 = require("../../db");
class ClaimController extends BaseController_1.BaseController {
    constructor() {
        super(...arguments);
        this.getClaims = (req, res) => {
            setTimeout(() => {
                this.sendSuccess(res, db_1.db.claims, 'Claims retrieved');
            }, 700);
        };
    }
}
exports.ClaimController = ClaimController;
