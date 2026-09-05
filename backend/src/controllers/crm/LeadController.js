"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadController = void 0;
const BaseController_1 = require("../BaseController");
const db_1 = require("../../db");
class LeadController extends BaseController_1.BaseController {
    constructor() {
        super(...arguments);
        this.getLeads = (req, res) => {
            setTimeout(() => {
                this.sendSuccess(res, db_1.db.leads, 'Leads retrieved');
            }, 800);
        };
        this.updateLeadStatus = (req, res) => {
            const { id } = req.params;
            const { status } = req.body;
            const lead = db_1.db.leads.find(l => l.id === id);
            if (lead) {
                lead.status = status;
                setTimeout(() => this.sendSuccess(res, lead, 'Lead updated'), 400);
            }
            else {
                this.sendError(res, 'Lead not found', 404);
            }
        };
    }
}
exports.LeadController = LeadController;
