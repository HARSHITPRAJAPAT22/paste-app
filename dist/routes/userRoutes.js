"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const client_1 = require("@prisma/client");
const hono_1 = require("hono");
const extension_accelerate_1 = require("@prisma/extension-accelerate");
const bcryptjs_1 = require("bcryptjs");
const jwt_1 = require("hono/jwt");
require("dotenv/config");
exports.userRouter = new hono_1.Hono();
const prisma = new client_1.PrismaClient().$extends((0, extension_accelerate_1.withAccelerate)());
/* -------------------------- User Authentication -------------------------- */
// Register a new user
exports.userRouter.post("/register", (c) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, password } = yield c.req.json();
    if (!userName || !password) {
        return c.json({ error: "Username and password are required" }, 400);
    }
    // Hash the password
    const hashedPassword = yield (0, bcryptjs_1.hash)(password, 10);
    try {
        const user = yield prisma.user.create({
            data: { userName, password: hashedPassword },
        });
        return c.json({ message: "User registered successfully", user });
    }
    catch (error) {
        return c.json({ error: "Username already exists" }, 400);
    }
}));
// Login a user
exports.userRouter.post("/login", (c) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, password } = yield c.req.json();
    const user = yield prisma.user.findUnique({ where: { userName } });
    if (!user)
        return c.json({ error: "User not found" }, 404);
    const isValidPassword = yield (0, bcryptjs_1.compare)(password, user.password);
    if (!isValidPassword)
        return c.json({ error: "Invalid credentials" }, 401);
    // Generate JWT Token
    const jwtSecret = c.env.JWT_SECRET || process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("JWT_SECRET is missing!");
        return c.json({ error: "Server misconfiguration: JWT_SECRET is missing" }, 500);
    }
    const token = yield (0, jwt_1.sign)({ userName: user.userName,
        userId: user.id
    }, jwtSecret);
    return c.json({ message: "Login successful", token });
}));
