// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const mysql = require("mysql");

// Create a new client instance
const client = new Client({ intents:
        [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES] });
const prefix = '?'
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command)
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Bot is running');
});

client.on("presenceUpdate", async function (oldMember, newMember) {
    // calls twitch_live_role function
    await client.commands.get("twitchLiveRole").execute(newMember);
});

client.on("messageCreate", async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
        case "latency":
            await client.commands.get("latency").execute(message, args);
            break;
        case "temporarychannel":
            console.log(`${message} ${args}`)
            await client.commands.get("temporaryChannel").execute(message, args);
            break;
    }

})




// Login to Discord with your client's token
client.login(token);
