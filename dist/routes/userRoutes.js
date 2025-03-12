import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { withAccelerate } from "@prisma/extension-accelerate";
import { hash, compare } from "bcryptjs";
import { sign } from "hono/jwt";
import dotenv from "dotenv";
dotenv.config();
export const userRouter = new Hono();
/* -------------------------- User Authentication -------------------------- */
// Register a new user
userRouter.post("/register", async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    console.log(process.env.DATABASE_URL);
    console.log(c.env.DATABASE_URL);
    const { userName, password } = await c.req.json();
    if (!userName || !password) {
        return c.json({ error: "Username and password are required" }, 400);
    }
    // Hash the password
    const hashedPassword = await hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: { userName, password: hashedPassword },
        });
        return c.json({ message: "User registered successfully", user });
    }
    catch (error) {
        return c.json({ error: "Username already exists" }, 400);
    }
});
// Login a user
userRouter.post("/login", async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const { userName, password } = await c.req.json();
    const user = await prisma.user.findUnique({ where: { userName } });
    if (!user)
        return c.json({ error: "User not found" }, 404);
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword)
        return c.json({ error: "Invalid credentials" }, 401);
    // Generate JWT Token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("JWT_SECRET is missing!");
        return c.json({ error: "Server misconfiguration: JWT_SECRET is missing" }, 500);
    }
    const token = await sign({ userName: user.userName,
        userId: user.id
    }, jwtSecret);
    return c.json({ message: "Login successful", token });
});
