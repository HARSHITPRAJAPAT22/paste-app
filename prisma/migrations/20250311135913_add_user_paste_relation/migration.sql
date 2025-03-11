/*
  Warnings:

  - You are about to drop the column `userName` on the `Paste` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Paste` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Paste_userName_key";

-- AlterTable
ALTER TABLE "Paste" DROP COLUMN "userName",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- AddForeignKey
ALTER TABLE "Paste" ADD CONSTRAINT "Paste_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
