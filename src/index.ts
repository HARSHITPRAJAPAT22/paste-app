import { Hono } from "hono";
import { cors } from 'hono/cors'
import { pasteRouter } from './routes/pasteRoutes'
import { userRouter } from './routes/userRoutes'
import { serve } from "@hono/node-server";
import { verify } from "hono/jwt";

const app = new Hono<{
    Bindings : {
        DATABASE_URL : string,
        JWT_SECRET : string
    },
    Variables : {
        userId : string
}}>();

app.use('/*', cors());
app.use("/api/v1/paste/*", async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) return c.json({ error: "Unauthorized" }, 401);
  
    const token = authHeader.split(" ")[1];
    try {
        c.env.JWT_SECRET = process.env.JWT_SECRET??"";
        const payload = await verify(token, c.env.JWT_SECRET);
        c.set("userId", payload.userId as string); 
        await next();
      } catch (error) {
        return c.json({ error: "Invalid token" }, 401);
      }
      
  });
app.route("/api/v1/user", userRouter);
app.route("/api/v1/paste", pasteRouter);


serve({
    fetch: app.fetch,
    port: 3000,
  });

  console.log("server is runing");
export default app;