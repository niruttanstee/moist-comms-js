/*
 * temporaryChannel
 * A function that creates a temporary channel for users when they join a certain channel. Once all users have left
 * that channel, the channel deletes automatically.
 * Functions:
 * setup creation channel, change temporary channel properties, create temporary channel, move user to channel,
 * check channel empty, delete channel, lock channel, unlock channel, request to join channel / accept by reacting,
 * add user to channel manually, change channel name(with limiter, option by premium and by setup),
 * change channel limit(option by premium and by setup), change channel bitrate(option by premium and by setup)
 */
const dayjs = require('dayjs');
const { MessageEmbed } = require("discord.js")

module.exports = {
    name: "temporaryChannel",
    description: "creates temporary channel",
    // put all functions in the execute() function
    async execute(message, args) {
        console.log(args)
    },
};
