const { Events } = require("discord.js");
const { DateTime } = require("luxon");
const client = require("../lib/db");
const { getLevel, createUserDb, createChannelDb } = require("../lib/user");
const { EmbedBuilder } = require("discord.js");

const COOLDOWN_DURATION_HOURS = process.env.XP_COOLDOWN;
const COOLDOWN_DURATION_MS = COOLDOWN_DURATION_HOURS * 60 * 60 * 1000;
const specialLevels = [3, 9, 18, 30, 45, 63, 84, 108, 135, 165, 200];

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    const date = DateTime.now();
    if (message.author.bot) {
      return;
    }
    const channel = await message.guild.channels.cache.get(
      process.env.LEVELS_CHANNEL,
    );
    try {
      const channelXp = await createChannelDb(message.channel.id, 5);
      const user = await createUserDb(message.author.id);
      if (
        (user.joinMessage == null || user.joinMessage == "") &&
        message.channelId == process.env.FIRST_MESSSAGE_CHANNEL
      ) {
        await client.user.updateMany({
          where: { id: user.id },
          data: { joinMessage: message.id },
        });
      }

      if (
        (user.joinMessageTwo == null || user.joinMessageTwo == "") &&
        message.channelId == process.env.SECOND_MESSAGE_CHANNEL
      ) {
        await client.user.updateMany({
          where: { id: user.id },
          data: { joinMessageTwo: message.id },
        });
      }
      console.log(channelXp.earnxp);
      if (!channelXp.earnxp) {
        return;
      }

      if (user.lastUpdated == null) {
        let level = getLevel(user.xp + channelXp.xp);
        if (level != user.level) {
          const embed = new EmbedBuilder()
            .setTitle(`${message.author.username} Level Updated`)
            .setColor(15844367)
            .setDescription(
              `↪ User: <@${
                message.author.id
              }>\n↪ Level: **${level}**\n↪ XP: ${user.xp + channelXp.xp}\n`,
            )
            .setTimestamp();
          channel.send({ embeds: [embed] });
        }

        const f = await client.user.update({
          where: { id: user.id },
          data: {
            xp: user.xp + channelXp.xp,
            level: level,
            lastUpdated: date.toMillis().toString(),
          },
        });
      }

      const lastMessage = DateTime.fromMillis(parseInt(user.lastUpdated));
      const timeElapsed = date.diff(lastMessage, "milliseconds");
      if (timeElapsed > COOLDOWN_DURATION_MS) {
        let level = getLevel(user.xp + channelXp.xp);
        if (level != user.level) {
          const embed = new EmbedBuilder()
            .setTitle(`${message.author.username} Level Updated`)
            .setColor(15844367)
            .setDescription(
              `↪ User: <@${
                message.author.id
              }>\n↪ Level: **${level}**\n↪ XP: ${user.xp + channelXp.xp}`,
            )
            .setTimestamp()
            .setThumbnail(message.author.displayAvatarURL());
          channel.send({ embeds: [embed] });
        }

        if (specialLevels.includes(level) && user.level != level) {
          const specialChannel = await message.guild.channels.cache.get(
            process.env.SPECIAL_LEVELS_CHANNEL,
          );
          if (!specialChannel) {
            return;
          }
          const specialMessage = getSpecialMessage(level, message.author.id);
          specialChannel.send(specialMessage);
        }

        const f = await client.user.update({
          where: { id: user.id },
          data: {
            xp: user.xp + channelXp.xp,
            level: level,
            lastUpdated: date.toMillis().toString(),
          },
        });
      }

      const d = await client.user.update({
        where: { id: user.id },
        data: { lastMessage: date.toMillis().toString() },
      });
    } catch (err) {
      console.log(err);
    }
  },
};

function getSpecialMessage(level, userId) {
  const specialMessages = {
    3: `<@${userId}>, Congratulations! You've reached level 3!`,
    9: `<@${userId}>, You're now at level 9! Great job!`,
    18: `<@${userId}>, Level 18 achieved! Keep it up!`,
    30: `<@${userId}>, Level 30 unlocked! You're doing amazing!`,
    45: `<@${userId}>, Wow! You've hit level 45! Keep going!`,
    63: `<@${userId}>, Incredible! Level 63 achieved!`,
    84: `<@${userId}>, Level 84 reached! You're unstoppable!`,
    108: `<@${userId}>, You've reached level 108! Amazing progress!`,
    135: `<@${userId}>, Level 135 unlocked! You're getting stronger!`,
    165: `<@${userId}>, Congratulations on reaching level 165!`,
    200: `<@${userId}>, You've reached the highest level possible - Level 200! You're a legend!`,
  };

  return specialMessages[level] || "";
}
