-- CreateTable
CREATE TABLE "WeekSlotConfig" (
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "simpleEnabled" BOOLEAN NOT NULL DEFAULT true,
    "doubleEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WeekSlotConfig_pkey" PRIMARY KEY ("weekday","startTime")
);

