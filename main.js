require('dotenv').config(); //initialize dotenv which allows invisible token file for security
const { Client, Intents } = require('discord.js');
const DateTime = require('datetime-js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// set the prefix for the bot
const prefix = "?";

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', async msg => {
    if (msg.content.startsWith("${prefix}latency")) {
        await msg.reply(new Date().getTime() - msg.createdTimestamp + " ms");
    }
});
//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login bot using .env