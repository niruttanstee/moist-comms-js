const dayjs = require("dayjs");
const {niruttID} = require("./guild.json");
module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Bot is running`);
        console.log(`${dayjs()}: Logged in as ${client.user.tag}.`);

        // initialise permissions
        await tempChannelPermissions(client);

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
            console.log(`${dayjs()}: Tempchannel function available.`)
        }
    }
};