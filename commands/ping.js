const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    // put all functions in the execute() function
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};
