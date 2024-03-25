const { SlashCommandBuilder } = require("discord.js");
const { execute } = require("./changexp");
const { PartialWebhookMixin } = require("discord.js");
const { ChannelType } = require("discord.js");
const { createChannelDb } = require("../lib/user");
const client = require("../lib/db");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("togglexp")
    .setDescription("Activer ou désactiver un salon d'xp")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Salon dont l'xp doit être activer/désactiver")
        .setRequired(true),
    ),

  async execute(interaction) {
    const channel = await interaction.options.getChannel("channel");
    if (channel.type != ChannelType.GuildText) {
      return interaction.reply("Le salon n'est pas un canal de texte !");
    }
    const data = await createChannelDb(
      channel.id,
      5,
      parseInt(process.env.XP_COOLDOWN),
    );
    if (data.earnxp) {
      await client.channelXP.updateMany({
        where: { channelId: channel.id },
        data: { earnxp: false },
      });
      interaction.reply(
        `Dans le salon <#${channel.id}> l'xp est désactiver ✅`,
      );
    } else {
      await client.channelXP.updateMany({
        where: { channelId: channel.id },
        data: { earnxp: true },
      });
      interaction.reply(`Dans le salon <#${channel.id}> l'xp est activer ✅`);
    }
  },
};
