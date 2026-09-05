"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
class BaseController {
    sendSuccess(res, data, message = 'Success') {
        return res.status(200).json({
            success: true,
            message,
            data
        });
    }
    sendError(res, message, code = 400) {
        return res.status(code).json({
            success: false,
            error: message
        });
    }
}
exports.BaseController = BaseController;
