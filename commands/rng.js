/*
 *  Function that uses RNG to do its function. Such as roll, as well as RNG name pickers.
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolls using RNG.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('number')
                .setDescription('Rolls a number between 0 and 100.')),

    async execute(interaction) {

        if (interaction.options.getSubcommand() === 'number') {
            return await rollNumber(interaction);
        }



    },
};

// roll number between 0 and 100.
async function rollNumber(interaction) {
    let number = Math.floor(Math.random() * 100) + 1;
    // Embed for successful detection of category ID
        const numberEmbed = new MessageEmbed()
            .setColor("#a73bd7")
            .setTitle(`Rolled ${number}`)
        return await interaction.reply({embeds: [numberEmbed]});
}