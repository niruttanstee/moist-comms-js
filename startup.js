/* const means fixed */
/* import Discord.js library */
const Discord = require("discord.js");
/* create client instance, a connection to discord*/
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "ALL"] })

/* check for events, on ready so activates when
the bot is ready to be used*/
client.on("ready", () => {
    console.log('Logged in as ${client.user.tag}!')
})

/* when discord message event is called, client on message
* and if the message content is ping
* reply pong */
client.on("message", msg => {
    if (msg.content === "ping") {
        msg.reply("pong");
    }
})

/* token.txt is used for declaring environment variables
* and is only visible to local user */
client.login('token');