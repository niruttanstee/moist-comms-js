const dayjs = require("dayjs");
module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Bot is running`);
        console.log(`${dayjs()}: Logged in as ${client.user.tag}`);
        }
};