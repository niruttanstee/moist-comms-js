const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js")
const dayjs = require('dayjs');
const {niruttID} = require("./guild.json");

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
        interaction.reply("Initialised.")
    },
};
