/*
  Warnings:

  - A unique constraint covering the columns `[ticketNumber]` on the table `TicketOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TicketOrder" ADD COLUMN     "ticketNumber" TEXT,
ADD COLUMN     "usedAt" TIMESTAMP(3),
ADD COLUMN     "usedBy" TEXT;

-- CreateTable
CREATE TABLE "PhysicalTicket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "eventId" TEXT,
    "ticketType" TEXT NOT NULL DEFAULT 'standard',
    "batchId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "usedAt" TIMESTAMP(3),
    "usedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhysicalTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalTicket_ticketNumber_key" ON "PhysicalTicket"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TicketOrder_ticketNumber_key" ON "TicketOrder"("ticketNumber");

-- AddForeignKey
ALTER TABLE "PhysicalTicket" ADD CONSTRAINT "PhysicalTicket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
