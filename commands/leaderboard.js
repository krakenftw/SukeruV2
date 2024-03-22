const { SlashCommandBuilder } = require("discord.js");
const client = require("../lib/db");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Display the leaderboard of top users by level"),
  async execute(interaction) {
    try {
      const topUsers = await client.user.findMany({
        orderBy: { level: "desc" },
        take: 15,
      });

      const embed = new EmbedBuilder()
        .setTitle("Leaderboard - Top Users by Level")
        .setColor("#ff9900")
        .setTimestamp();
      let description = "";
      const medalEmojis = ["🥇", "🥈", "🥉"];

      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        const medal = i < 3 ? medalEmojis[i] : "🎖️"; // Assign medal emojis to top 3 users
        description += `${medal} <@${user.userId}>\n‎ ‎ ‎ ‎ ↠  Level ${user.level} ( ${user.xp} )\n`;
      }
      embed.setDescription(description);
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply(
        "An error occurred while fetching the leaderboard.",
      );
    }
  },
};
