const { SlashCommandBuilder } = require('@discordjs/builders');
const {niruttID} = require("./guild.json");
const dayjs = require("dayjs");
const {MessageEmbed} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setDefaultPermission(true)
        .setName('permission')
        .setDescription('Permission function.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('update')
                .setDescription('Update command permissions.')),

    async execute(interaction) {
        const client = interaction.client;
        const member = interaction.member;

        // initialise permissions
        if (await tempChannelPermissions(client)) {
            await permissionUpdated();
        }


        // temporary channel permission properties
        async function tempChannelPermissions(client) {
            if (!client.application?.owner) await client.application?.fetch();
            const tempChannel = await client.guilds.cache.get('860934544693919744')?.commands.fetch('913385355967885362');
            const permissions = [
                {
                    id: niruttID,
                    type: 'USER',
                    permission: true,
                },
            ];
            await tempChannel.permissions.set({permissions});
            console.log(`${dayjs()}: Tempchannel function's permission updated.`)
            return true;
        }


        //replies with success embed
        async function permissionUpdated() {
            const permissionUpdated = new MessageEmbed()
                .setColor("#5bc04c")
                .setTitle(`Permissions updated.`)
            await interaction.reply({embeds: [permissionUpdated]});
            return console.log(`${dayjs()}: ${member.displayName} updated permissions.`)
        }
    },
};
