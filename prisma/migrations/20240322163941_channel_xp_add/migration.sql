-- CreateTable
CREATE TABLE "ChannelXP" (
    "id" SERIAL NOT NULL,
    "channelId" TEXT NOT NULL,
    "xp" INTEGER,

    CONSTRAINT "ChannelXP_pkey" PRIMARY KEY ("id")
);
