"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const authMiddleware = (req, res, next) => {
    var _a;
    if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.userId)) {
        return res.status(401).json({ message: "Not logged in" });
    }
    next();
};
exports.authMiddleware = authMiddleware;
