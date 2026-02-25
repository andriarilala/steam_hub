-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "TicketOrder" ADD COLUMN     "reference" TEXT;
