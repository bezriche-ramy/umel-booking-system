-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('PROSPECT', 'CONVERTIE');

-- CreateEnum
CREATE TYPE "CustomerSource" AS ENUM ('AMELIA_IMPORT', 'WEB', 'ADMIN');

-- CreateEnum
CREATE TYPE "Civility" AS ENUM ('MME', 'M');

-- CreateEnum
CREATE TYPE "SlotType" AS ENUM ('SIMPLE', 'DOUBLE');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AlterationStatus" AS ENUM ('SCHEDULED', 'DONE', 'NO_SHOW', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'SEAMSTRESS');

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "MessageKind" AS ENUM ('CONFIRMATION', 'REMINDER', 'ALTERATION_REMINDER', 'CANCELLATION', 'RESCHEDULE', 'DEPOSIT_CHARGED', 'DEPOSIT_FAILED', 'CAMPAIGN');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "civility" "Civility",
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'PROSPECT',
    "source" "CustomerSource" NOT NULL DEFAULT 'WEB',
    "weddingDate" TEXT,
    "notes" TEXT,
    "stripeCustomerId" TEXT,
    "marketingOptOut" BOOLEAN NOT NULL DEFAULT false,
    "legacyAmeliaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "slotType" "SlotType" NOT NULL DEFAULT 'SIMPLE',
    "status" "AppointmentStatus" NOT NULL DEFAULT 'CONFIRMED',
    "projectNotes" TEXT,
    "notes" TEXT,
    "stripeSetupIntentId" TEXT,
    "stripePaymentMethodId" TEXT,
    "depositCharged" BOOLEAN NOT NULL DEFAULT false,
    "depositPaymentIntentId" TEXT,
    "depositChargeError" TEXT,
    "depositChargedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "legacyAmeliaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlterationAppointment" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "seamstressName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "status" "AlterationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "dressDetails" TEXT,
    "devis" DECIMAL(10,2),
    "notes" TEXT,
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlterationAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleConfig" (
    "weekday" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "startHour" INTEGER NOT NULL DEFAULT 10,
    "lastSlotHour" INTEGER NOT NULL DEFAULT 17,
    "simpleEnabled" BOOLEAN NOT NULL DEFAULT true,
    "doubleEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ScheduleConfig_pkey" PRIMARY KEY ("weekday")
);

-- CreateTable
CREATE TABLE "DateOverride" (
    "day" TEXT NOT NULL,
    "isOpen" BOOLEAN,
    "simpleEnabled" BOOLEAN,
    "doubleEnabled" BOOLEAN,
    "note" TEXT,

    CONSTRAINT "DateOverride_pkey" PRIMARY KEY ("day")
);

-- CreateTable
CREATE TABLE "SlotOverride" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "simpleEnabled" BOOLEAN NOT NULL DEFAULT true,
    "doubleEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SlotOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageLog" (
    "id" TEXT NOT NULL,
    "channel" "MessageChannel" NOT NULL DEFAULT 'EMAIL',
    "kind" "MessageKind" NOT NULL,
    "status" "MessageStatus" NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "providerId" TEXT,
    "error" TEXT,
    "customerId" TEXT,
    "appointmentId" TEXT,
    "alterationId" TEXT,
    "campaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "sentBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_stripeCustomerId_key" ON "Customer"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_legacyAmeliaId_key" ON "Customer"("legacyAmeliaId");

-- CreateIndex
CREATE INDEX "Customer_lastName_firstName_idx" ON "Customer"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "Customer"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_reference_key" ON "Appointment"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_stripeSetupIntentId_key" ON "Appointment"("stripeSetupIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_legacyAmeliaId_key" ON "Appointment"("legacyAmeliaId");

-- CreateIndex
CREATE INDEX "Appointment_day_startTime_idx" ON "Appointment"("day", "startTime");

-- CreateIndex
CREATE INDEX "Appointment_date_idx" ON "Appointment"("date");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "AlterationAppointment_date_idx" ON "AlterationAppointment"("date");

-- CreateIndex
CREATE INDEX "AlterationAppointment_seamstressName_idx" ON "AlterationAppointment"("seamstressName");

-- CreateIndex
CREATE UNIQUE INDEX "SlotOverride_day_startTime_key" ON "SlotOverride"("day", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "MessageLog_createdAt_idx" ON "MessageLog"("createdAt");

-- CreateIndex
CREATE INDEX "MessageLog_kind_idx" ON "MessageLog"("kind");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlterationAppointment" ADD CONSTRAINT "AlterationAppointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotOverride" ADD CONSTRAINT "SlotOverride_day_fkey" FOREIGN KEY ("day") REFERENCES "DateOverride"("day") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_alterationId_fkey" FOREIGN KEY ("alterationId") REFERENCES "AlterationAppointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
