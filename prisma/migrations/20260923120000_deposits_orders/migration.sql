-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ON_HOLD', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'CHARGED', 'FAILED', 'REFUNDED', 'EXPIRED', 'NO_CARD');

-- AlterEnum
ALTER TYPE "CustomerSource" ADD VALUE 'WOOCOMMERCE_IMPORT';

-- DropIndex
DROP INDEX "Appointment_stripeSetupIntentId_key";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "depositChargeError",
DROP COLUMN "depositCharged",
DROP COLUMN "depositChargedAt",
DROP COLUMN "depositPaymentIntentId",
DROP COLUMN "stripePaymentMethodId",
DROP COLUMN "stripeSetupIntentId";

-- AlterTable
ALTER TABLE "MessageLog" ADD COLUMN     "depositId" TEXT;

-- CreateTable
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "customerId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'COMPLETED',
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "depositCents" INTEGER NOT NULL DEFAULT 2000,
    "origin" TEXT,
    "billingName" TEXT,
    "billingEmail" TEXT,
    "billingPhone" TEXT,
    "stripeCustomerId" TEXT,
    "stripePaymentMethodId" TEXT,
    "stripeSetupIntentId" TEXT,
    "consentAt" TIMESTAMP(3),
    "depositStatus" "DepositStatus" NOT NULL DEFAULT 'PENDING',
    "chargedAt" TIMESTAMP(3),
    "chargeIntentId" TEXT,
    "chargeReason" TEXT,
    "chargeError" TEXT,
    "legacyWooOrderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Deposit_number_key" ON "Deposit"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Deposit_appointmentId_key" ON "Deposit"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Deposit_stripeSetupIntentId_key" ON "Deposit"("stripeSetupIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Deposit_legacyWooOrderId_key" ON "Deposit"("legacyWooOrderId");

-- CreateIndex
CREATE INDEX "Deposit_createdAt_idx" ON "Deposit"("createdAt");

-- CreateIndex
CREATE INDEX "Deposit_status_idx" ON "Deposit"("status");

-- CreateIndex
CREATE INDEX "Deposit_depositStatus_idx" ON "Deposit"("depositStatus");

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "Deposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

