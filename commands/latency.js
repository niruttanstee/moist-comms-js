const { SlashCommandBuilder } = require('@discordjs/builders');
const dayjs = require('dayjs');
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('latency')
        .setDescription("Replies with the bot's latency."),
    async execute(interaction) {
        let member = interaction.member;
        // get timestamp and current date/time
        let timestamp = interaction.createdAt;
        let now = dayjs()
        const latency = now - timestamp
        // console log
        console.log(`${now}: ${member.displayName} fetched bot latency of ${latency}ms.`)
        // reply to user using embed
        if (latency < 125) {
            const latencyEmbedGood = new MessageEmbed()
                .setColor("#5bc04c")
                .setTitle(`${latency}ms`)
                .setDescription("This is nominal.")
            await interaction.reply({ embeds: [latencyEmbedGood]});
        }
        else if (latency >= 125 && latency <= 200) {
            const latencyEmbedAverage = new MessageEmbed()
                .setColor("#debb32")
                .setTitle(`Fetched latency: ${latency}ms`)
                .setDescription("Slower than usual.")
            await interaction.reply({ embeds: [latencyEmbedAverage]});
        }
        else {
            const latencyEmbedBad = new MessageEmbed()
                .setColor("#da4747")
                .setTitle(`Fetched latency: ${latency}ms`)
                .setDescription("Very slow.")
            await interaction.reply({ embeds: [latencyEmbedBad]});
        }
    },
};
