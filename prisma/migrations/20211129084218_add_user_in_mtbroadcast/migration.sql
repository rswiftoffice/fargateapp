/*
  Warnings:

  - Added the required column `userId` to the `MTBroadcast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MTBroadcast" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "MTBroadcast" ADD CONSTRAINT "MTBroadcast_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
