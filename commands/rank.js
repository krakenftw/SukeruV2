const { SlashCommandBuilder, hyperlink, hideLinkEmbed } = require("discord.js");
const client = require("../lib/db");
const { createUserDb } = require("../lib/user");
const { EmbedBuilder } = require("discord.js");
const { DateTime } = require("luxon");
const { isInternalDeclaration } = require("typescript");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Permet d'avoir des informations sur l'utilisateur")
    .addUserOption((user) =>
      user
        .setName("user")
        .setDescription("L'utilisateur à afficher")
        .setRequired(false),
    ),
  async execute(interaction) {
    const info = await interaction.options.getUser("user");
    let member;
    if (info) {
      member = await interaction.guild.members.fetch(info.id);
    } else {
      member = await interaction.guild.members.fetch(interaction.user.id);
    }
    const userId = member.user.id;
    console.log(userId);

    let user = await client.user.findFirst({
      where: { userId: userId },
    });
    let usersData;
    if (!user) {
      user = await createUserDb(userId);
    }
    usersData = await client.user.findMany({
      orderBy: {
        xp: "desc",
      },
    });
    try {
      const userIndex = usersData.findIndex((u) => u.id === user.id) + 1;
      let userRoles = "";
      member.roles.cache.forEach((each) => {
        userRoles += `<@&${each.id}> `;
      });

      const createdTime = interaction.user.createdAt;
      const createdTimeSeconds = DateTime.fromJSDate(createdTime).toSeconds();
      const createdTimeDiscord = createdTimeSeconds.toString().split(".")[0];
      const joinedTime = DateTime.fromJSDate(user.joined)
        .toSeconds()
        .toString()
        .split(".")[0];

      let firstMessage;
      let secondMessage;
      if (user.joinMessage) {
        firstMessage = `https://discord.com/channels/${interaction.guild.id}/${process.env.FIRST_MESSSAGE_CHANNEL}/${user.joinMessage}`;
      }
      if (user.joinMessageTwo) {
        secondMessage = `https://discord.com/channels/${interaction.guild.id}/${process.env.SECOND_MESSAGE_CHANNEL}/${user.joinMessageTwo}`;
      }
      const embed = new EmbedBuilder()
        .setColor(15418782)
        .setTitle(`Informations sur l'utilisateur`)
        .setColor(2303786)
        .setDescription(
          `<:member02:1221030298947420200> **Utilisateur:** <@${
            member.user.id
          }>\n<:trophy01:1221029823334580264> **Classement dans le serveur:** \`${userIndex}\`\n<:level:1221029827893657650> **Niveau:** \`${
            user.level
          }\`\n<:xp:1221032646767808553> **Nombre total d'XP:** \`${
            user.xp
          }\`\n<:role:1221030937203048578> **Rôles:** ${userRoles}\n<:created:1221030941007417344> **Date de création du compte:** <t:${createdTimeDiscord}:D>\n<:joined2:1221030939279364168> **Date d'arrivé:** <t:${joinedTime}:D>\n${
            firstMessage ? hyperlink("<:iconlink:1221029826337701948> Premier message", firstMessage) : ""
          } \n${
            secondMessage ? hyperlink("<:iconlink:1221029826337701948> Deuxième message", secondMessage) : ""
          }`,
        )
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.log(err);
    }
  },
};
