const { SlashCommandBuilder } = require('@discordjs/builders');
const {niruttID} = require("./guild.json");
const dayjs = require("dayjs");
const {MessageEmbed} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setDefaultPermission(false)
        .setName('permission')
        .setDescription('Permission function.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('update')
                .setDescription('Update command permissions.')),

    async execute(interaction) {
        const client = interaction.client;
        const guildId = '860934544693919744';

        // // initialise permissions
        // if (await perms(client)
        //     && await tempChannelPermissions(client)) {
        //     await permissionUpdated();
        // }
        //
        // // permissions update permission properties
        // async function perms(client) {
        //     if (!client.application?.owner) await client.application?.fetch();
        //     const tempChannel = await client.guilds.cache.get(guildId)?.commands.fetch('913553831311314954');
        //     const permissions = [
        //         {
        //             id: niruttID,
        //             type: 'USER',
        //             permission: true,
        //         },
        //     ];
        //     await tempChannel.permissions.set({permissions});
        //     console.log(`${dayjs()}: Permission function's permission updated.`)
        //     return true;
        // }
        //
        // // temporary channel permission properties
        // async function tempChannelPermissions(client) {
        //     if (!client.application?.owner) await client.application?.fetch();
        //     const tempChannel = await client.guilds.cache.get(guildId)?.commands.fetch('913385355967885362');
        //     const permissions = [
        //         {
        //             id: niruttID,
        //             type: 'USER',
        //             permission: true,
        //         },
        //     ];
        //     await tempChannel.permissions.set({permissions});
        //     console.log(`${dayjs()}: Tempchannel function's permission updated.`)
        //     return true;
        // }
        //
        //
        // //replies with success embed
        // async function permissionUpdated() {
        //     const permissionUpdated = new MessageEmbed()
        //         .setColor("#5bc04c")
        //         .setTitle(`Permissions updated`)
        //     await interaction.reply({embeds: [permissionUpdated]});
        // }
    },
};
