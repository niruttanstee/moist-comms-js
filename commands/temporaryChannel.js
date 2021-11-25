const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js")
const dayjs = require('dayjs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempchannel')
        .setDescription('Temporary channel function.')
        .setDefaultPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup temporary channel.')),



    async execute(interaction) {
        const client = interaction.client;
        console.log(await client.application.commands.permissions.commandId);
        interaction.reply("test")
    },
};
