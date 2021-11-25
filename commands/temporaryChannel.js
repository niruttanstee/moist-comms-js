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
        const client = interaction.client;
        const guild = interaction.guild;

        // initialise permissions
        await tempChannelPermissions(client, guild);

        async function tempChannelPermissions(client) {
            if (!client.application?.owner) await client.application?.fetch();
            const tempChannel = await client.guilds.cache.get('860934544693919744')?.commands.fetch('913385355967885362');
            const permissions = [
                {
                    id: niruttID,
                    type: 'USER',
                    permission: false,
                },
            ];
            await tempChannel.permissions.set({permissions});
            interaction.reply("test")
        }
    },
};
