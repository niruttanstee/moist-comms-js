const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js")
const dayjs = require('dayjs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Report to admin.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('bot')
                .setDescription('Report bot problem.')
                .addStringOption(option => option.setName('problem').setDescription('Input the report').setRequired(true))),

    async execute(interaction) {
        // function to get problem value
        await getProblem(interaction);

        async function getProblem(interaction) {
            const report = interaction.options.getString('problem');
            let client = interaction.client
            let member = interaction.member;
            let timestamp = interaction.createdAt;
            let channel = interaction.channel;
            const botReportEmbed = new MessageEmbed()
                .setColor("#5bc04c")
                .setTitle(`Bot report submitted`)
                .setDescription(`Thank you for reporting a problem relating to the bot.`)
            await sendProblem(report, member, timestamp, channel, client);
            await interaction.reply({ embeds: [botReportEmbed]});
            return console.log(`${dayjs()}: ${member.displayName} sumitted a bot report.`)

        }
        // function to send report to bot developer (nirutt)
        async function sendProblem(report, member, timestamp, channel, client){
            const {niruttID} = require('./guild.json');
            let niruttObject = client.users.cache.get(niruttID);
            const botReportToUserEmbed = new MessageEmbed()
                .setColor("#da4747")
                .setTitle(`Bot report notice`)
                .setDescription(`${timestamp}
                                **${member.displayName}** has reported a bug.
                                **Channel:** <#${channel.id}>
                                \n**Report:** ${report}`)
            return await niruttObject.send({ embeds: [botReportToUserEmbed]})
        }



    },
};
