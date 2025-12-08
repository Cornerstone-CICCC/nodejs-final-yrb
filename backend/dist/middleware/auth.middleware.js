"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLogout = exports.checkLogin = void 0;
const checkLogin = (req, res, next) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.status(401).json({
            message: "You are not allowed to access this!",
        });
    }
    next();
};
exports.checkLogin = checkLogin;
const checkLogout = (req, res, next) => {
    if (req.session && req.session.isLoggedIn) {
        return res.status(400).json({
            message: "You are already logged in!",
        });
    }
    next();
};
exports.checkLogout = checkLogout;
