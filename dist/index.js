"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const server_1 = __importDefault(require("./server"));
const port = Number(process.env.PORT || 3000);
server_1.default.listen(port, () => {
    console.log(`✅ API running at http://localhost:${port}`);
});
