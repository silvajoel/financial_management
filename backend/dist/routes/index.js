"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const accountRoutes_1 = __importDefault(require("./accountRoutes"));
const categoryRoutes_1 = __importDefault(require("./categoryRoutes"));
const transactionRoutes_1 = __importDefault(require("./transactionRoutes"));
const goalRoutes_1 = __importDefault(require("./goalRoutes"));
const invoiceRoutes_1 = __importDefault(require("./invoiceRoutes"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use('/accounts', auth_1.authMiddleware, accountRoutes_1.default);
router.use('/categories', auth_1.authMiddleware, categoryRoutes_1.default);
router.use('/transactions', auth_1.authMiddleware, transactionRoutes_1.default);
router.use('/goals', auth_1.authMiddleware, goalRoutes_1.default);
router.use('/invoices', auth_1.authMiddleware, invoiceRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map