const { PermissionFlagsBits } = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");
const client = require("../lib/db");
const { createChannelDb } = require("../lib/user");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changecooldown")
    .setDescription("Change Cooldown of a channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption((option) =>
      option
        .setName("cooldown")
        .setDescription("Cooldown in hours")
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel whose cooldown is to be changed")
        .setRequired(true),
    ),
  async execute(interaction) {
    const cooldown = await interaction.options.getInteger("cooldown");
    const channel = await interaction.options.getChannel("channel");
    let data = await client.channelXP.findFirst({
      where: { channelId: channel.id },
    });
    if (!data) {
      await createChannelDb(channel.id, 5, cooldown);
    } else {
      await client.channelXP.updateMany({
        where: { channelId: channel.id },
        data: { cooldown: cooldown },
      });
    }

    interaction.reply(
      `Successfully changed <#${channel.id}> 's cooldown to ${cooldown} hours!`,
    );
  },
};
