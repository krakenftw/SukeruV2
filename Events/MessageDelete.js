const { Events } = require("discord.js");
const Discord = require("discord.js");
const { EmbedBuilder, quote } = require("discord.js");
const client = require("../lib/db");
const { DateTime } = require("luxon");
const { createUserDb } = require("../lib/user");

module.exports = {
  name: Events.MessageDelete,
  async execute(message) {
    try {
      const data = await client.user.findFirst({
        where: { userId: message.author.id },
      });
      if (!data) {
        createUserDb(message.user.id);
      }
      if (data.xp > 5) {
        const m = await client.user.update({
          where: { id: data.id },
          data: { xp: data.xp - 5 },
        });
      }
    } catch (err) {
      console.log(err);
    }
  },
};
