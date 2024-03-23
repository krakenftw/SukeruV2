const { SlashCommandBuilder, hyperlink, hideLinkEmbed } = require("discord.js");
const client = require("../lib/db");
const { createUserDb } = require("../lib/user");
const { EmbedBuilder } = require("discord.js");
const { DateTime } = require("luxon");
const { isInternalDeclaration } = require("typescript");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Get your rank info!")
    .addUserOption((user) =>
      user
        .setName("user")
        .setDescription("target user for rank")
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
        .setTitle(`${member.user.username} Rank Info`)
        .setColor(2303786)
        .setDescription(
          `↪ User: <@${
            member.user.id
          }>\n↪ Rank In Server: **${userIndex}**\n↪ Level: **${
            user.level
          }**\n↪ Total XP : **${
            user.xp
          }**\n↪ User Roles : ${userRoles}\n↪ Created At: <t:${createdTimeDiscord}:D>\n↪ Joined Server: <t:${joinedTime}:D>\n${
            firstMessage ? hyperlink("📎 First Message", firstMessage) : ""
          } \n${
            secondMessage ? hyperlink("📎 Second Message", secondMessage) : ""
          }`,
        )
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.log(err);
    }
  },
};
