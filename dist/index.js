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
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const pasteRoutes_1 = require("./routes/pasteRoutes");
const userRoutes_1 = require("./routes/userRoutes");
const node_server_1 = require("@hono/node-server");
const jwt_1 = require("hono/jwt");
const app = new hono_1.Hono();
app.use('/*', (0, cors_1.cors)());
app.use("/api/v1/paste/*", (c, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authHeader = c.req.header("Authorization");
    console.log("Authorization Header:", authHeader);
    if (!authHeader)
        return c.json({ error: "Unauthorized" }, 401);
    const token = authHeader.split(" ")[1];
    console.log("JWT Token:", token);
    try {
        console.log("JWT_SECRET:", process.env.JWT_SECRET);
        c.env.JWT_SECRET = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "";
        const payload = yield (0, jwt_1.verify)(token, c.env.JWT_SECRET);
        console.log("JWT Payload:", payload);
        c.set("userId", payload.userId);
        console.log("User ID:", payload.userId);
        yield next();
    }
    catch (error) {
        console.error("JWT Verification Error:", error);
        return c.json({ error: "Invalid token" }, 401);
    }
}));
app.route("/api/v1/user", userRoutes_1.userRouter);
app.route("/api/v1/paste", pasteRoutes_1.pasteRouter);
(0, node_server_1.serve)({
    fetch: app.fetch,
    port: 3000,
});
console.log("server is runing");
exports.default = app;
