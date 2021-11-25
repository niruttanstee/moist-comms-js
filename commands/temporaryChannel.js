const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js")
const dayjs = require('dayjs');

module.exports = {
    defaultPermission: false,
    data: new SlashCommandBuilder()
        .setName('tempchannel')
        .setDescription('Temporary channel function.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup temporary channel.')),

    async execute(interaction) {
        // function to get problem value
        return console.log("tested")



    },
};
