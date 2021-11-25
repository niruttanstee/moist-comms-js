const dayjs = require("dayjs");
module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Bot is running`);
        console.log(`${dayjs()}: Logged in as ${client.user.tag}.`);
        const guilds = client.guilds;
        const guild = await client.guilds.cache.get('860934544693919744');

/*        guild.commands.fetch({ guild: "860934544693919744" })
            .then(perms => console.log(perms))
            .catch(console.error);*/

        //console.log( client.commands.keys());

    }
};