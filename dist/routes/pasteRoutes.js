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
exports.pasteRouter = void 0;
const client_1 = require("@prisma/client");
const hono_1 = require("hono");
const extension_accelerate_1 = require("@prisma/extension-accelerate"); // Import Zod schemas
//@ts-ignore
const harshit221202_1 = require("harshit221202");
exports.pasteRouter = new hono_1.Hono();
const prisma = new client_1.PrismaClient().$extends((0, extension_accelerate_1.withAccelerate)());
/* ------------------------------- Create Paste ------------------------------- */
exports.pasteRouter.post("/create", (c) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = c.get("userId");
    if (!userId)
        return c.json({ error: "Unauthorized" }, 401);
    try {
        const body = yield c.req.json();
        const validatedData = harshit221202_1.createPostInput.parse(body); // Validate input
        const newPaste = yield prisma.paste.create({
            data: Object.assign(Object.assign({}, validatedData), { userId }),
        });
        return c.json({ message: "Paste created successfully", paste: newPaste });
    }
    catch (error) {
        return c.json({ error }, 400); // Send validation errors
    }
}));
/* ---------------------------- Get Paste by ID ---------------------------- */
exports.pasteRouter.get("/:id", (c) => __awaiter(void 0, void 0, void 0, function* () {
    const pasteId = c.req.param("id");
    const paste = yield prisma.paste.findUnique({ where: { id: pasteId } });
    if (!paste)
        return c.json({ error: "Paste not found" }, 404);
    return c.json(paste);
}));
/* ---------------------- Get All Pastes by a User ---------------------- */
exports.pasteRouter.get("/user/:userId", (c) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = c.req.param("userId");
    const pastes = yield prisma.paste.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
    return c.json(pastes);
}));
/* ---------------------------- Update a Paste ---------------------------- */
exports.pasteRouter.put("/:id", (c) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = c.get("userId");
    if (!userId)
        return c.json({ error: "Unauthorized" }, 401);
    const pasteId = c.req.param("id");
    try {
        const body = yield c.req.json();
        const validatedData = harshit221202_1.updatePostInput.parse(body); // Validate input
        const paste = yield prisma.paste.findUnique({ where: { id: pasteId } });
        if (!paste)
            return c.json({ error: "Paste not found" }, 404);
        if (paste.userId !== userId)
            return c.json({ error: "Not authorized" }, 403);
        const updatedPaste = yield prisma.paste.update({
            where: { id: pasteId },
            data: validatedData,
        });
        return c.json({ message: "Paste updated successfully", paste: updatedPaste });
    }
    catch (error) {
        return c.json({ error }, 400);
    }
}));
/* ---------------------------- Delete a Paste ---------------------------- */
exports.pasteRouter.delete("/:id", (c) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = c.get("userId");
    if (!userId)
        return c.json({ error: "Unauthorized" }, 401);
    const pasteId = c.req.param("id");
    // Ensure paste exists and belongs to the user
    const paste = yield prisma.paste.findUnique({ where: { id: pasteId } });
    if (!paste)
        return c.json({ error: "Paste not found" }, 404);
    if (paste.userId !== userId)
        return c.json({ error: "Not authorized" }, 403);
    yield prisma.paste.delete({ where: { id: pasteId } });
    return c.json({ message: "Paste deleted successfully" });
}));
exports.default = exports.pasteRouter;
