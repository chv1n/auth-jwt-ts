"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.me = me;
const prisma_1 = __importDefault(require("../prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validators_1 = require("../utils/validators");
function signAccessToken(userId) {
    const secret = process.env.JWT_SECRET;
    return jsonwebtoken_1.default.sign({ sub: userId }, secret, { expiresIn: '15m' });
}
async function register(req, res) {
    try {
        const parsed = validators_1.registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.format() });
        }
        const { email, password, name } = parsed.data;
        const exists = await prisma_1.default.user.findUnique({ where: { email } });
        if (exists) {
            return res.status(409).json({ message: 'Email already registered' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.default.user.create({
            data: { email, passwordHash, name }
        });
        const token = signAccessToken(user.id);
        return res.status(201).json({
            user: { id: user.id, email: user.email, name: user.name },
            accessToken: token
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}
async function login(req, res) {
    try {
        const parsed = validators_1.loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.format() });
        }
        const { email, password } = parsed.data;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            return res.status(401).json({ message: 'Invalid email or password' });
        const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!ok)
            return res.status(401).json({ message: 'Invalid email or password' });
        const token = signAccessToken(user.id);
        return res.json({
            user: { id: user.id, email: user.email, name: user.name },
            accessToken: token
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}
async function me(req, res) {
    try {
        if (!req.userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, name: true, createdAt: true }
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        return res.json({ user });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Server error' });
    }
}
