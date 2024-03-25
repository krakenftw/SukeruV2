const { Events } = require("discord.js");
const { DateTime } = require("luxon");
const client = require("../lib/db");
const {
  getLevel,
  createUserDb,
  createChannelDb,
  createMessageData,
} = require("../lib/user");
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
      const channelXp = await createChannelDb(
        message.channel.id,
        5,
        parseInt(process.env.XP_COOLDOWN),
      );
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
      if (!channelXp.earnxp) {
        return;
      }

      const data = await client.lastMessage.findFirst({
        where: { channelId: message.channel.id, userId: message.author.id },
      });

      if (data) {
        const time = DateTime.fromMillis(parseInt(data.time));
        const diff = date.diff(time, ["hours"]);
        if (diff.hours >= channelXp.cooldown) {
          await updateData(data, date, user, channelXp, message);
        }
      } else {
        console.log("here");
        await createMessageData(
          message.channel.id,
          message.author.id,
          date.toMillis(),
        );
        await updateData(data, date, user, channelXp);
      }

      //   const lastMessage = DateTime.fromMillis(parseInt(user.lastUpdated));
      //   const timeElapsed = date.diff(lastMessage, "milliseconds");
      //   if (timeElapsed > COOLDOWN_DURATION_MS) {
      //     let level = getLevel(user.xp + channelXp.xp);
      //     if (level != user.level) {
      //       const embed = new EmbedBuilder()
      //         .setTitle(`Niveau supérieur`)
      //         .setColor(15844367)
      //         .setDescription(
      //           `**Félicitations <@${message.author.id}>, tu as atteint le niveau** \`${level}\``,
      //         )
      //         .setTimestamp()
      //         .setThumbnail(message.author.displayAvatarURL());
      //       channel.send({ embeds: [embed] });
      //     }
      //
      //     if (specialLevels.includes(level) && user.level != level) {
      //       const specialChannel = await message.guild.channels.cache.get(
      //         process.env.SPECIAL_LEVELS_CHANNEL,
      //       );
      //       if (!specialChannel) {
      //         return;
      //       }
      //       const specialMessage = getSpecialMessage(level, message.author.id);
      //       specialChannel.send(specialMessage);
      //     }
      //
      //     const f = await client.user.update({
      //       where: { id: user.id },
      //       data: {
      //         xp: user.xp + channelXp.xp,
      //         level: level,
      //         lastUpdated: date.toMillis().toString(),
      //       },
      //     });
      //   }
      //
      await client.user.update({
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
    3: `<@${userId}>, **Vous êtes enfin prêt pour passer au rang supérieur** \`Caporal\``,
    9: `<@${userId}>, **Vous êtes enfin prêt pour passer au rang supérieur** \`Sergent\``,
    18: `<@${userId}>, **Vous êtes enfin prêt pour passer au rang supérieur** \`Adjudant\``,
    30: `<@${userId}>, **Vous êtes enfin prêt pour passer au rang supérieur** \`Major\``,
    45: `<@${userId}>, **Vous êtes enfin prêt pour passer au rang supérieur** \`Aspirant\``,
    63: `<@${userId}>, **Vous êtes enfin prêt pour passer au rang supérieur** \`Sous-lieutenant\``,
    84: `<@${userId}>, **Vous êtes enfin prêt pour passer au rang supérieur** \`Lieutenant\``,
    108: `<@${userId}>, **Vous êtes enfin prêt pour passer au rang supérieur** \`Capitaine\``,
    135: `<@${userId}>, **Vous êtes enfin prêt pour passer au rang supérieur** \`Commandant\``,
    165: `<@${userId}>, **Vous êtes enfin prêt pour passer au rang supérieur** \`Lieutenant-Colonel\``,
    200: `<@${userId}>, **Vous êtes enfin prêt pour passer au rang supérieur** \`Colonel\``,
  };

  return specialMessages[level] || "";
}

async function updateData(data, date, user, channelXp, message) {
  if (data) {
    await client.lastMessage.update({
      where: { id: data.id },
      data: { time: date.toMillis().toString() },
    });
  }
  const xp = user.xp + channelXp.xp;
  const level = getLevel(xp);
  if (level != user.level) {
    const levelsChannel = await message.guild.channels.fetch(
      process.env.LEVELS_CHANNEL,
    );
    const embed = new EmbedBuilder()
      .setTitle(`Niveau supérieur`)
      .setColor(15844367)
      .setDescription(
        `**Félicitations <@${message.author.id}>, tu as atteint le niveau** \`${level}\``,
      )
      .setTimestamp()
      .setThumbnail(message.author.displayAvatarURL());
    levelsChannel.send({ embeds: [embed] });
  }

  if (specialLevels.includes(level) && user.level != level) {
    const specialChannel = await message.guild.channels.fetch(
      process.env.SPECIAL_LEVELS_CHANNEL,
    );
    if (!specialChannel) {
      return;
    }
    const specialMessage = getSpecialMessage(level, message.author.id);
    specialChannel.send(specialMessage);
  }

  await client.user.update({
    where: { id: user.id },
    data: { xp, level },
  });
}
