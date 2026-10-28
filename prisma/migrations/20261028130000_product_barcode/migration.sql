-- AlterTable
ALTER TABLE "Product" ADD COLUMN "barcode" TEXT;

-- CreateIndex
CREATE INDEX "Product_boutiqueId_barcode_idx" ON "Product"("boutiqueId", "barcode");
