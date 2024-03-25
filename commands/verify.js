const { SlashCommandBuilder } = require("discord.js");
const client = require("../lib/db");
const { EmbedBuilder } = require("discord.js");
const { DateTime } = require("luxon");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Classement sur l'inactivité du serveur"),
  async execute(interaction) {
    const data = await client.user.findMany({
      orderBy: { lastMessage: "asc" },
    });
    let rankData = ``;

    for (let i = 0; i < Math.min(data.length, 10); i++) {
      const time = DateTime.fromMillis(parseInt(data[i].lastMessage))
        .toSeconds()
        .toString()
        .split(".")[0];
      rankData += `<@${data[i].userId}> -> <t:${time}:R>\n`;
    }
    const embed = new EmbedBuilder()
      .setColor(1752220)
      .setTimestamp()
      .setTitle("Informations sur les utilisateurs en fonction de l'activité")
      .setDescription(rankData);
    interaction.reply({ embeds: [embed] });
  },
};
