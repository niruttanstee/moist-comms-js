const dayjs = require("dayjs");
const {niruttID} = require("./guild.json");
module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Bot is running`)
        console.log(`${dayjs()}: Logged in as ${client.user.tag}`);
        const {niruttID} = require('./guild.json');

        const guild = client.guilds.cache.get("860934544693919744");
        console.log(`${dayjs()}: Permission handling, initialised.`)
        // call permissions handling
        await tempChannelPermissions(client, guild);

        async function tempChannelPermissions(client){
            // permissions handling
            if (!client.application?.owner) await client.application?.fetch();
            const tempChannel = await client.guilds.cache.get('860934544693919744')?.commands.fetch('913385355967885362');
            const permissions = [
                {
                    id: `${niruttID}`,
                    type: 'USER',
                    permission: true,
                },
            ];
            await tempChannel.permissions.add({ permissions });
            console.log(`${dayjs()}: TempChannel ready.`)
        }
    }
};