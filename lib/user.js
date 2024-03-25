const { DateTime } = require("luxon");
const client = require("./db");

const getLevel = (xp) => {
  return Math.floor(xp / 100);
};
const createUserDb = async (userId) => {
  let data = await client.user.findFirst({ where: { userId: userId } });
  const date = DateTime.now();

  if (!data) {
    data = await client.user.create({
      data: { userId: userId, joined: date.toISO(), xp: 0, level: 1 },
    });
  }
  return data;
};

const createChannelDb = async (channelId, xp, cooldown) => {
  let data = await client.channelXP.findFirst({
    where: { channelId: channelId },
  });
  if (!data) {
    data = await client.channelXP.create({
      data: {
        channelId,
        xp,
        earnxp: true,
        cooldown,
      },
    });
  }
  return data;
};

const createMessageData = async (channelId, userId, time) => {
  await client.lastMessage.create({
    data: {
      channelId,
      userId,
      time: time.toString(),
    },
  });
};
module.exports = { getLevel, createMessageData, createChannelDb, createUserDb };
