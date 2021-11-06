// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const prefix = '?'

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

client.on("message", message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    const command = args.shift().toLowerCase();

    if(command === `${prefix}ping`){
        console.log("command ping initiated")
        client.commands.get("ping").execute(message, args);
    }
})

// Login to Discord with your client's token
client.login(token);
