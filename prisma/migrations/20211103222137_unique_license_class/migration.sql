/*
  Warnings:

  - A unique constraint covering the columns `[class]` on the table `LicenseClass` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LicenseClass_class_key" ON "LicenseClass"("class");
