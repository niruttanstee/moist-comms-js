/*
* Function to calculate latency in ms.
* Once the initial command is called:
* Get timestamp of the command
* Get current date/time
*
* Calculate latency:
* Date/time - timestamp
*/
// initialise dayjs for time
const dayjs = require('dayjs');
// initialise embed
const { MessageEmbed } = require("discord.js")

module.exports = {
        name: "latency",
        description: "Get latency of bot",
    // put all functions in the execute() function
    async execute(message) {
        let user = message.author
        // get timestamp and current date/time
        let timestamp = message.createdTimestamp
        let now = dayjs()
        const latency = now - timestamp
        // console log
        console.log(`${now}: ${user.username} fetched bot latency of ${latency}ms.`)
        // reply to user using embed
        if (latency < 125) {
            const latencyEmbedGood = new MessageEmbed()
                .setColor("#5bc04c")
                .setTitle(`Fetched latency: ${latency}ms`)
                .setDescription("Nominal.")
            await message.reply({ embeds: [latencyEmbedGood]});
        }
        else if (latency >= 125 && latency <= 200) {
            const latencyEmbedAverage = new MessageEmbed()
                .setColor("#debb32")
                .setTitle(`Fetched latency: ${latency}ms`)
                .setDescription("Slower than usual.")
            await message.reply({ embeds: [latencyEmbedAverage]});
        }
        else {
            const latencyEmbedBad = new MessageEmbed()
                .setColor("#da4747")
                .setTitle(`Fetched latency: ${latency}ms`)
                .setDescription("Server problems.")
            await message.reply({ embeds: [latencyEmbedBad]});
        }
    },
};
