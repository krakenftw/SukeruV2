const { Events } = require("discord.js");
const { name } = require("./ready");
const { EmbedBuilder } = require("discord.js");
const client = require("../lib/db");

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    const createdTime = new Date(member.user.createdAt);
    const joinedTime = new Date(member.joinedAt);
    const currTime = new Date();
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
        .setTitle(`Goodbye, ${member.user.tag}!`)
        .setDescription(
          `We will miss you.\nHope to see you again\n↪ User Name: <@${
            member.user.id
          }>\n↪ Created On: ${createdTime.toLocaleString()}\n↪ Joined On: ${joinedTime.toLocaleString()}\n↪ Leave Time: ${currTime.toLocaleString()}`,
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      channel.send({ embeds: [embed] });
    } catch (err) {
      console.log(err);
    }
  },
};
