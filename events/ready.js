const dayjs = require("dayjs");
const { pool } = require("../db");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        client.user.setActivity('Moist Comms', { type: 'WATCHING' });

        console.log(`Bot is running`);
        console.log(`${dayjs()}: Logged in as ${client.user.tag}.`);


        // pool.query(`SELECT * FROM "temporaryChannelProperties"`, async function (err, result, fields) {
        //     console.log(result.rows.length)
        //     if (err) ;
        // });

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
                         { 
                            id: '917895361039859733',
                            permissions: [{
                                id: '861049651012435998',
                                type: 'ROLE',
                                permission: true,
                            }],
                        },
                        { 
                            id: '923973282796044339',
                            permissions: [{
                                id: '862087786579230761',
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