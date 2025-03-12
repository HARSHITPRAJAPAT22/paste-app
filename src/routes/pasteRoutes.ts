import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { withAccelerate } from "@prisma/extension-accelerate";// Import Zod schemas
//@ts-ignore
import {createPostInput, updatePostInput } from 'harshit221202';
import dotenv from "dotenv";
dotenv.config();
export const pasteRouter = new Hono<{
  Bindings: { DATABASE_URL: string ,
    JWT_SECRET : string
  };
  Variables: { userId: string };
}>();


/* ------------------------------- Create Paste ------------------------------- */
pasteRouter.post("/create", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());
  console.log(c.env.DATABASE_URL);
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const body = await c.req.json();
    const validatedData = createPostInput.parse(body); // Validate input

    const newPaste = await prisma.paste.create({
      data: { ...validatedData, userId },
    });

    return c.json({ message: "Paste created successfully", paste: newPaste });
  } catch (error) {
    return c.json({ error }, 400); // Send validation errors
  }
});

/* ---------------------------- Get Paste by ID ---------------------------- */
pasteRouter.get("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const pasteId = c.req.param("id");

  const paste = await prisma.paste.findUnique({ where: { id: pasteId } });

  if (!paste) return c.json({ error: "Paste not found" }, 404);

  return c.json(paste);
});

/* ---------------------- Get All Pastes by a User ---------------------- */
pasteRouter.get("/user/:userId", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = c.req.param("userId");

  const pastes = await prisma.paste.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return c.json(pastes);
});

/* ---------------------------- Update a Paste ---------------------------- */
pasteRouter.put("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const pasteId = c.req.param("id");

  try {
    const body = await c.req.json();
    const validatedData = updatePostInput.parse(body); // Validate input

    const paste = await prisma.paste.findUnique({ where: { id: pasteId } });
    if (!paste) return c.json({ error: "Paste not found" }, 404);
    if (paste.userId !== userId) return c.json({ error: "Not authorized" }, 403);

    const updatedPaste = await prisma.paste.update({
      where: { id: pasteId },
      data: validatedData,
    });

    return c.json({ message: "Paste updated successfully", paste: updatedPaste });
  } catch (error) {
    return c.json({ error }, 400);
  }
});

/* ---------------------------- Delete a Paste ---------------------------- */
pasteRouter.delete("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const pasteId = c.req.param("id");

  // Ensure paste exists and belongs to the user
  const paste = await prisma.paste.findUnique({ where: { id: pasteId } });
  if (!paste) return c.json({ error: "Paste not found" }, 404);
  if (paste.userId !== userId) return c.json({ error: "Not authorized" }, 403);

  await prisma.paste.delete({ where: { id: pasteId } });

  return c.json({ message: "Paste deleted successfully" });
});

export default pasteRouter;
