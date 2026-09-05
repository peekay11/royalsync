"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const BaseController_1 = require("../BaseController");
const db_1 = require("../../db");
class TaskController extends BaseController_1.BaseController {
    constructor() {
        super(...arguments);
        this.getTasks = (req, res) => {
            setTimeout(() => {
                this.sendSuccess(res, db_1.db.tasks, 'Tasks retrieved');
            }, 500);
        };
        this.toggleTask = (req, res) => {
            const { id } = req.params;
            const task = db_1.db.tasks.find(t => t.id === id);
            if (task) {
                task.status = task.status === 'open' ? 'completed' : 'open';
                setTimeout(() => this.sendSuccess(res, task, 'Task updated'), 300);
            }
            else {
                this.sendError(res, 'Not found', 404);
            }
        };
    }
}
exports.TaskController = TaskController;
