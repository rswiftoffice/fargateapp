-- DropForeignKey
ALTER TABLE "CheckIn" DROP CONSTRAINT "CheckIn_fileId_fkey";

-- CreateTable
CREATE TABLE "_CheckInToFile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CheckInToFile_AB_unique" ON "_CheckInToFile"("A", "B");

-- CreateIndex
CREATE INDEX "_CheckInToFile_B_index" ON "_CheckInToFile"("B");

-- AddForeignKey
ALTER TABLE "_CheckInToFile" ADD FOREIGN KEY ("A") REFERENCES "CheckIn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CheckInToFile" ADD FOREIGN KEY ("B") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
