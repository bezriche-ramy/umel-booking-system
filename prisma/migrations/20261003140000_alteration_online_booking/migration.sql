-- AlterTable
ALTER TABLE "AlterationAppointment" ADD COLUMN     "bookedOnline" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AlterationScheduleConfig" (
    "weekday" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "startHour" INTEGER NOT NULL DEFAULT 10,
    "lastSlotHour" INTEGER NOT NULL DEFAULT 16,

    CONSTRAINT "AlterationScheduleConfig_pkey" PRIMARY KEY ("weekday")
);

-- CreateTable
CREATE TABLE "AlterationClosedDay" (
    "day" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "AlterationClosedDay_pkey" PRIMARY KEY ("day")
);

