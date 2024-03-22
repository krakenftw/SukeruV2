const { SlashCommandBuilder } = require("discord.js");
const client = require("../lib/db");
const { createUserDb, getLevel } = require("../lib/user");
const { EmbedBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adminxp")
    .setDescription("Manage/Reset XP!")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommandGroup((subCommandGroup) =>
      subCommandGroup
        .setName("reset")
        .setDescription("ResetData")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("user")
            .setDescription("Reset User Data")
            .addUserOption((option) =>
              option
                .setName("resetuser")
                .setRequired(true)
                .setDescription("User to reset"),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("server").setDescription("Reset Server Data"),
        ),
    )

    .addSubcommand((subcommand) =>
      subcommand
        .setName("give")
        .setDescription("Give XP to user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to give XP to")
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("xp")
            .setDescription("The amount of XP to give")
            .setRequired(false),
        )
        .addIntegerOption((option) =>
          option
            .setName("level")
            .setDescription("Change Level")
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove XP from user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to remove XP from")
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("xp")
            .setDescription("The amount of XP to remove")
            .setRequired(false),
        )
        .addIntegerOption((option) =>
          option
            .setName("level")
            .setDescription("Change Level")
            .setRequired(false),
        ),
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const xp = interaction.options.getInteger("xp");
    const level = interaction.options.getInteger("level");
    const subCommand = interaction.options.getSubcommand();
    if (subCommand == "server") {
      await client.user.updateMany({ data: { level: 0, xp: 0 } });
      return interaction.reply(
        "successfully resetted XP and Level of all users in server!",
      );
    }
    if (subCommand == "user") {
      const resetUser = await interaction.options.getUser("resetuser");
      await client.user.updateMany({
        where: { userId: resetUser.id },
        data: { level: 0, xp: 0 },
      });
      return interaction.reply(
        `successfully resetted XP and Level ${resetUser.username} in server!`,
      );
    }
    if (xp == null && level == null) {
      return interaction.reply(
        "XP and/or Level Not provided. Need atleast one to run the command!",
      );
    }

    if (subCommand == "give") {
      try {
        let targetUser = await client.user.findFirst({
          where: { userId: user.id },
        });

        if (!targetUser) {
          targetUser = await createUserDb(user.id);
        }

        let updatedxp = targetUser.xp;

        if (level) {
          updatedxp += level * 100;
        }
        if (xp) {
          updatedxp += xp;
        }

        const updatedLevel = getLevel(updatedxp);

        await client.user.update({
          where: { id: targetUser.id },
          data: {
            xp: updatedxp,
            level: updatedLevel,
          },
        });

        const embed = new EmbedBuilder()
          .setTitle("XP Given Successfully")
          .setDescription(
            `${xp ? xp : 0} xp and ${
              level ? level : 0
            } level has been added to <@${
              user.id
            }> 's account\nHe is now level ${updatedLevel} with ${updatedxp} xp!`,
          )
          .setColor("#00ff00")
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(error);
        await interaction.reply("An error occurred while giving XP.");
      }
    } else if (subCommand == "remove") {
      try {
        const userData = await client.user.findFirst({
          where: { userId: user.id },
        });
        if (!userData) {
          return await interaction.reply("User data not found.");
        }

        if (userData.xp < xp) {
          return await interaction.reply(
            "User does not have enough XP to remove.",
          );
        }
        let updatedXp = userData.xp;
        if (level) {
          updatedXp -= level * 100;
        }
        if (xp) {
          updatedXp -= xp;
        }
        const updatedLevel = getLevel(updatedXp);

        await client.user.update({
          where: { id: userData.id },
          data: { xp: updatedXp, level: updatedLevel },
        });

        const embed = new EmbedBuilder()
          .setTitle(`${user.username} XP Removed`)
          .setColor("#ff0000")
          .setDescription(
            `${xp ? xp : 0} xp and ${
              level ? level : 0
            } level has been removed from <@${
              user.id
            }> 's account\nHe is now level ${updatedLevel} with ${updatedXp} xp!`,
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(error);
        await interaction.reply("An error occurred while removing XP.");
      }
    }
  },
};
