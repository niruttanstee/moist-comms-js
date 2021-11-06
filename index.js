// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const prefix = '?'
let option;

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command)
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!');
});

client.on("messageCreate", message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    switch(command) {
        case 0:
            option = "ping";
            console.log("command ping initiated")
            client.commands.get("ping").execute(message, args);
            break
    }
})

// Login to Discord with your client's token
client.login(token);
