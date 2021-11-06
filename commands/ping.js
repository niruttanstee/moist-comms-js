module.exports = {
        name: "ping",
        description: "Replies with Pong!",
    // put all functions in the execute() function
    async execute(message, args) {
        await message.channel.reply("Pong!")
    },
};
