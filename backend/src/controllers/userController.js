"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
const User_1 = require("../models/User");
const getUsers = (req, res) => {
    res.json(User_1.users);
};
exports.getUsers = getUsers;
