const dayjs = require("dayjs");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        client.user.setActivity('Moist Comms', { type: 'WATCHING' });

        console.log(`Bot is running`);
        console.log(`${dayjs()}: Logged in as ${client.user.tag}.`);

        const allGuilds = client.guilds;
        await allGuilds.fetch()
            .then(async value => {
                let id = value.keys();
                for (const x of id) {
                    const fullPermissions = [
                        {
                            id: '917539855230205983',
                            permissions: [{
                                id: '862092581361156106',
                                type: 'ROLE',
                                permission: true,
                            }],
                        },
                    ];
                    await client.guilds.cache.get(x)?.commands.permissions.set({fullPermissions});
                }
            })
    }

};