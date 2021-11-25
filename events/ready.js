const dayjs = require("dayjs");
const {niruttID} = require("./guild.json");
module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Bot is running`);
        console.log(`${dayjs()}: Logged in as ${client.user.tag}.`);
    }
};