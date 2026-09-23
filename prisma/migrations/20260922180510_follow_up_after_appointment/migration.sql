-- AlterEnum
ALTER TYPE "MessageKind" ADD VALUE 'FOLLOW_UP';

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "followUpSentAt" TIMESTAMP(3);
