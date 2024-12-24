-- CreateTable
CREATE TABLE "_LicenseClassToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LicenseClassToUser_AB_unique" ON "_LicenseClassToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_LicenseClassToUser_B_index" ON "_LicenseClassToUser"("B");

-- AddForeignKey
ALTER TABLE "_LicenseClassToUser" ADD FOREIGN KEY ("A") REFERENCES "LicenseClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LicenseClassToUser" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
