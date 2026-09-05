import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { db, saveDb } from '../../db';

export class TaskController extends BaseController {
  public getTasks = (req: Request, res: Response) => {
    setTimeout(() => {
      this.sendSuccess(res, db.tasks, 'Tasks retrieved');
    }, 500);
  };
  
  public toggleTask = (req: Request, res: Response) => {
    const { id } = req.params;
    const task = db.tasks.find(t => t.id === id);
    if(task) {
      task.status = task.status === 'open' ? 'completed' : 'open';
      saveDb();
      setTimeout(() => this.sendSuccess(res, task, 'Task updated'), 300);
    } else {
      this.sendError(res, 'Not found', 404);
    }
  };
}
