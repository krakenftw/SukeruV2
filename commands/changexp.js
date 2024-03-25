const { ChannelType } = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");
const client = require("../lib/db");
const { createChannelDb } = require("../lib/user");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changexp")
    .setDescription("Modifier le message xp du salon")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Salon dont l'xp doit être modifié")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option.setName("xp").setDescription("XP to set").setRequired(true),
    ),

  async execute(interaction) {
    const channel = await interaction.options.getChannel("channel");
    const xp = await interaction.options.getInteger("xp");
    try {
      if (channel.type != ChannelType.GuildText) {
        return interaction.reply("Le salon donné n'est pas un salon de texte.");
      }
      const data = await client.channelXP.findFirst({
        where: { channelId: channel.id },
      });
      if (!data) {
        await createChannelDb(channel.id, xp, 18);
      } else {
        await client.channelXP.updateMany({
          where: { channelId: channel.id },
          data: { xp },
        });
      }
      interaction.reply(
        `Mise à jour réussie <#${channel.id}> Le message d'XP à **${xp}**`,
      );
    } catch (err) {
      console.log(err);
    }
  },
};
