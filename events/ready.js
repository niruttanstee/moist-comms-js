const dayjs = require("dayjs");
module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Bot is running`);
        console.log(`${dayjs()}: Logged in as ${client.user.tag}`);
        const {niruttID} = require('./guild.json');

        const guild = client.guilds.cache.get("860934544693919744");
        console.log(`${dayjs()}: Permission handling, initialised.`);

            console.log(`${dayjs()}: TempChannel ready.`)
        }
};