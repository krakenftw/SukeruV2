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
    .setDescription("toggle channel xp ")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel whose xp is to be stopped/started")
        .setRequired(true),
    ),

  async execute(interaction) {
    const channel = await interaction.options.getChannel("channel");
    if (channel.type != ChannelType.GuildText) {
      return interaction.reply("Channel is not a Text Channel!");
    }
    const data = await createChannelDb(channel.id, 5);
    if (data.earnxp) {
      await client.channelXP.updateMany({
        where: { channelId: channel.id },
        data: { earnxp: false },
      });
      interaction.reply(`Successfully disabled XP from <#${channel.id}> ✅`);
    } else {
      await client.channelXP.updateMany({
        where: { channelId: channel.id },
        data: { earnxp: true },
      });
      interaction.reply(`Successfully enabled XP from <#${channel.id}> ✅`);
    }
  },
};
