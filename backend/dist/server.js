"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
require("./models");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express_1.default.json());
app.use('/api', routes_1.default);
app.get('/api/health', async (_req, res) => {
    try {
        await database_1.sequelize.authenticate();
        res.json({ status: 'ok', database: 'connected' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map