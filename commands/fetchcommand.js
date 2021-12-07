const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fetchcommand')
        .setDescription('admin use.'),
    async execute(interaction) {

        const guild = interaction.guild;
        await guild.commands.fetch()
            .then(commands => {
                console.log(commands);
            }).catch(console.error);
    },
};
