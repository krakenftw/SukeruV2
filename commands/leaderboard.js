const { SlashCommandBuilder } = require("discord.js");
const client = require("../lib/db");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription(
      "Afficher le classement des meilleurs utilisateurs par niveau",
    ),
  async execute(interaction) {
    try {
      const topUsers = await client.user.findMany({
        orderBy: { xp: "desc" },
        take: 15,
      });

      const embed = new EmbedBuilder()
        .setTitle("Classement - Meilleurs utilisateurs par niveau")
        .setColor("#ff9900")
        .setTimestamp();
      let description = "";
      const medalEmojis = ["🥇", "🥈", "🥉"];

      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        const medal = i < 3 ? medalEmojis[i] : "🎖️"; // Assign medal emojis to top 3 users
        description += `${medal} <@${user.userId}>\n‎ ‎ ‎ ‎ ➥  Level ${user.level} ( ${user.xp} )\n`;
      }
      embed.setDescription(description);
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply(
        "Une erreur s'est produite lors de l'extraction du classement.",
      );
    }
  },
};
