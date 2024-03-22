const { SlashCommandBuilder } = require("discord.js")
const client = require("../lib/db")
const { EmbedBuilder } = require("discord.js")
const { DateTime } = require("luxon")


function formatTimeAgo(milliseconds) {
    const time = DateTime.fromMillis(Date.now() - milliseconds);
    const diff = time.diffNow().shiftTo('hours', 'days', 'months', 'years').toObject();
    console.log(diff)
    if (Math.abs(diff.years) >= 1) {
        return Math.abs(diff.years).toFixed(0) + " years ago";
    } else if (Math.abs(diff.months) >= 1) {
        return Math.abs(diff.months).toFixed(0) + " months ago";
    } else if (Math.abs(diff.days) >= 1) {
        return Math.abs(diff.days).toFixed(0) + " days ago";
    } else if (Math.abs(diff.hours) >= 1) {
        return Math.abs(diff.hours).toFixed(0) + " hours ago";
    } else {
        return "Just now";
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Rank info in server"),
    async execute(interaction) {

        const data = await client.user.findMany({ orderBy: { lastMessage: "asc" } })
        let rankData = ``;

        for (let i = 0; i < Math.min(data.length, 10); i++) {
            const time = DateTime.fromMillis(parseInt(data[i].lastMessage));
            const diff = time.diffNow()
            rankData += `<@${data[i].userId}> -> ${formatTimeAgo(diff)}\n`
        }
        const embed = new EmbedBuilder().setColor(1752220).setTimestamp().setTitle("User Info based on activity").setDescription(rankData)
        interaction.reply({ embeds: [embed] })


    }
}