-- CreateTable
CREATE TABLE "lastMessage" (
    "id" SERIAL NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "time" TEXT NOT NULL,

    CONSTRAINT "lastMessage_pkey" PRIMARY KEY ("id")
);
