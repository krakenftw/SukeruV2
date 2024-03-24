const { SlashCommandBuilder } = require("discord.js");
const client = require("../lib/db");
const { createUserDb, getLevel } = require("../lib/user");
const { EmbedBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adminxp")
    .setDescription("Gestion/réinitialisation d'XP !")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommandGroup((subCommandGroup) =>
      subCommandGroup
        .setName("reset")
        .setDescription("Réinitialiser les données")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("user")
            .setDescription("Réinitialiser les données de l'utilisateur")
            .addUserOption((option) =>
              option
                .setName("resetuser")
                .setRequired(true)
                .setDescription("Réinitialisation par l'utilisateur"),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("server").setDescription("Réinitialiser les données du serveur"),
        ),
    )

    .addSubcommand((subcommand) =>
      subcommand
        .setName("give")
        .setDescription("Donner l'XP à l'utilisateur")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("L'utilisateur à qui attribuer l'XP")
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("xp")
            .setDescription("La quantité d'XP à donner")
            .setRequired(false),
        )
        .addIntegerOption((option) =>
          option
            .setName("level")
            .setDescription("Changement de niveau")
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Supprimer l'XP de l'utilisateur")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("L'utilisateur à qui il faut retirer l'XP")
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("xp")
            .setDescription("La quantité de l'XP à supprimer")
            .setRequired(false),
        )
        .addIntegerOption((option) =>
          option
            .setName("level")
            .setDescription("Changement de niveau")
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
        "réinitialisation réussie de l'XP et du niveau de tous les utilisateurs du serveur !",
      );
    }
    if (subCommand == "user") {
      const resetUser = await interaction.options.getUser("resetuser");
      await client.user.updateMany({
        where: { userId: resetUser.id },
        data: { level: 0, xp: 0 },
      });
      return interaction.reply(
        `réinitialisation réussie de l'XP et du niveau de **${resetUser.username}** dans le serveur !`,
      );
    }
    if (xp == null && level == null) {
      return interaction.reply(
        "XP et/ou niveau non fournis. Il en faut au moins un pour exécuter la commande !",
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
          .setTitle("XP donner avec succès")
          .setDescription(
            `**${xp ? xp : 0}** xp et **${
              level ? level : 0
            }** a été ajouté à <@${
              user.id
            }> \nIl est maintenant au niveau **${updatedLevel}** avec **${updatedxp}** xp!`,
          )
          .setColor("#00ff00")
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(error);
        await interaction.reply("Une erreur s'est produite lors de l'attribution d'XP.");
      }
    } else if (subCommand == "remove") {
      try {
        const userData = await client.user.findFirst({
          where: { userId: user.id },
        });
        if (!userData) {
          return await interaction.reply("Données utilisateur introuvables.");
        }

        if (userData.xp < xp) {
          return await interaction.reply(
            "L'utilisateur n'a pas assez de XP pour procéder à la suppression.",
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
          .setTitle(`XP supprimé`)
          .setColor("#ff0000")
          .setDescription(
            `${xp ? xp : 0} xp et ${
              level ? level : 0
            } niveau a été supprimé de <@${
              user.id
            }> \nIl est maintenant au niveau ${updatedLevel} avec ${updatedXp} xp!`,
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(error);
        await interaction.reply("Une erreur s'est produite lors de la suppression de XP.");
      }
    }
  },
};
