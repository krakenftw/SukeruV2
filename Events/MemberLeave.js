const { Events } = require("discord.js");
const { name } = require("./ready");
const { EmbedBuilder } = require("discord.js");
const client = require("../lib/db");
const { DateTime } = require("luxon");

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    const createdTime = DateTime.fromJSDate(member.user.createdAt)
      .toSeconds()
      .toString()
      .split(".")[0];

    const joinedTime = DateTime.fromJSDate(member.joinedAt)
      .toSeconds()
      .toString()
      .split(".")[0];

    const currTime = DateTime.now().toSeconds().toString().split(".")[0];
    const channel = await member.guild.channels.cache.get(
      process.env.LEAVE_CHANNEL,
    );
    if (!channel) return;
    try {
      const userData = await client.user.findFirst({
        where: { userId: member.user.id },
      });
      if (userData) {
        await client.user.deleteMany({
          where: {
            userId: member.user.id,
          },
        });
      }
      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle(`Au revoir ! ${member.user.tag}!`)
        .setDescription(
          `Vous nous manquerez.\nJ'espère vous revoir\n↪ Utilisateur: <@${member.user.id}>\n↪ Créer le: <t:${createdTime}:d>\n↪ Rejoint le: <t:${joinedTime}:d>\n↪ Leave Time: <t:${currTime}:d>`,
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      channel.send({ embeds: [embed] });
    } catch (err) {
      console.log(err);
    }
  },
};
