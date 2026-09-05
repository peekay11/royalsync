"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
const BaseController_1 = require("../BaseController");
const db_1 = require("../../db");
class ClientController extends BaseController_1.BaseController {
    constructor() {
        super(...arguments);
        this.getClients = (req, res) => {
            // Simulate network delay for loaders
            setTimeout(() => {
                this.sendSuccess(res, db_1.db.clients, 'Clients retrieved');
            }, 800);
        };
        this.createClient = (req, res) => {
            const newClient = Object.assign(Object.assign({ id: `cli_${Date.now()}` }, req.body), { kycStatus: 'pending' });
            db_1.db.clients.unshift(newClient);
            setTimeout(() => {
                this.sendSuccess(res, newClient, 'Client created successfully');
            }, 600);
        };
    }
}
exports.ClientController = ClientController;
