const { Events } = require("discord.js");
const Discord = require("discord.js");
const { EmbedBuilder, quote } = require("discord.js");
const client = require("../lib/db");
const { DateTime } = require('luxon');
const { createUserDb } = require("../lib/user");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const createdTime = new Date(member.user.createdAt)
    const joinedTime = new Date(member.joinedAt)
    try {
      const data = await client.user.findFirst({ where: { userId: member.user.id } });
      console.log("Data ", data)
      if (!data) {
        createUserDb(member.user.id)
      }

    } catch (err) {
      console.log(err)
    }

    const channel = await member.guild.channels.cache.get(
      process.env.WELCOME_CHANNEL,
    );
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`Welcome to the server, ${member.user.tag}!`)
      .setDescription(`We are glad to have you with us.\n↪ User Name: <@${member.user.id}>\n↪ Created On: ${createdTime.toLocaleString()}\n↪ Joined On: ${joinedTime.toLocaleString()}\n`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    channel.send({ embeds: [embed] });

    // }),
    //
    // try {
    //   const img = await canva.welcome(member, {
    //     link: "https://wallpapercave.com/wp/wp5128415.jpg",
    //   });
    //   const attachment = new Discord.MessageAttachment(img, "welcome-img.png");
    //   channel.send(
    //     `Welcome to the server, ${member.user.username}!`,
    //     attachment,
    //   );
    // } catch (err) {
    //   console.log(err);
    // }
  },
};
