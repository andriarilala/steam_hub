/*
  Warnings:

  - A unique constraint covering the columns `[qrCode]` on the table `TicketOrder` will be added. If there are existing duplicate values, this will fail.
  - The required column `qrCode` was added to the `TicketOrder` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "TicketOrder" ADD COLUMN     "eventId" TEXT,
ADD COLUMN     "qrCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TicketOrder_qrCode_key" ON "TicketOrder"("qrCode");

-- AddForeignKey
ALTER TABLE "TicketOrder" ADD CONSTRAINT "TicketOrder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
