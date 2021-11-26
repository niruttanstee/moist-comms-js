const dayjs = require("dayjs");
const {niruttID} = require("./guild.json");
module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        client.user.setActivity('Moist Comms', { type: 'WATCHING' });

        console.log(`Bot is running`);
        console.log(`${dayjs()}: Logged in as ${client.user.tag}.`);
        const guildId = '860934544693919744';

        // initialise permissions
        if (await perms(client)
            && await tempChannelPermissions(client)) {

        }

        async function perms(client) {
            if (!client.application?.owner) await client.application?.fetch();
            const tempChannel = await client.guilds.cache.get(guildId)?.commands.fetch('913553831311314954');
            const permissions = [
                {
                    id: '862092581361156106',
                    type: 'ROLE',
                    permission: true,
                },
            ];
            await tempChannel.permissions.add({permissions});
            console.log(`${dayjs()}: Permission function's permission updated.`)
            return true;
        }


        // temporary channel permission properties
        async function tempChannelPermissions(client) {
            if (!client.application?.owner) await client.application?.fetch();
            const tempChannel = await client.guilds.cache.get(guildId)?.commands.fetch('913385355967885362');
            const permissions = [
                {
                    id: '862092581361156106',
                    type: 'ROLE',
                    permission: true,
                },
            ];
            await tempChannel.permissions.add({permissions});
            console.log(`${dayjs()}: Tempchannel function's permission updated.`)
            return true;

        }
    }

};