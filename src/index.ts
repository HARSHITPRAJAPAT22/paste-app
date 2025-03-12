import { Hono } from "hono";
import { cors } from 'hono/cors'
import { pasteRouter } from './routes/pasteRoutes.js'
import { userRouter } from './routes/userRoutes.js'
import { verify } from "hono/jwt";
import dotenv from "dotenv";
import { serve } from "@hono/node-server";
dotenv.config();
// console.log("main chal rha hun1");
const app = new Hono<{
    Bindings : {
        DATABASE_URL : string,
        JWT_SECRET : string
    },
    Variables : {
        userId : string
}}>();
// console.log("main chal rha hun2");
// console.log(process.env.DATABASE_URL);
app.use('/*', cors());
// console.log("main chal rha hun3");

app.use("/api/v1/paste/*", async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) return c.json({ error: "Unauthorized" }, 401);
  
    const token = authHeader.split(" ")[1];
    try {
        const payload = await verify(token, c.env.JWT_SECRET);
        c.set("userId", payload.userId as string); 
        await next();
      } catch (error) {
        return c.json({ error: "Invalid token" }, 401);
      }
      
  });
// console.log("main chal rha hun4");

app.route("/api/v1/user", userRouter);
// console.log("main chal rha hun5");

app.route("/api/v1/paste", pasteRouter);
// console.log("main chal rha hun6");
if (!process.env.CF_PAGES) {
  serve(app, (info) => {
    console.log(`🚀 Server running on http://localhost:${info.port}`);
  });
}

export default app;