const { ChannelType } = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");
const client = require("../lib/db");
const { createChannelDb } = require("../lib/user");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changexp")
    .setDescription("Change message xp of channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel whose xp is to be changed")
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
        return interaction.reply("‼️ Given channel is not a text channel.");
      }
      const data = await client.channelXP.findFirst({
        where: { channelId: channel.id },
      });
      if (!data) {
        await createChannelDb(channel.id, xp);
      } else {
        await client.channelXP.updateMany({
          where: { channelId: channel.id },
          data: { xp },
        });
      }
      interaction.reply(
        `Successfully updated <#${channel.id}> 's message XP to ${xp}`,
      );
    } catch (err) {
      console.log(err);
    }
  },
};
