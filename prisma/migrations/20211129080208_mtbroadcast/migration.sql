-- AlterTable
ALTER TABLE "File" ADD COLUMN     "mTBroadcastId" INTEGER;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_mTBroadcastId_fkey" FOREIGN KEY ("mTBroadcastId") REFERENCES "MTBroadcast"("id") ON DELETE SET NULL ON UPDATE CASCADE;
