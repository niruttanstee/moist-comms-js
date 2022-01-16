const dayjs = require("dayjs");
const mysql = require("mysql");
// const {database_host, port, database_username, database_password, database_name} = require("../database.json");
const {setupTempChannel, autoSetup} = require("../commands/temporaryChannel");
const {reviewProperties} = require("../commands/temporaryChannel");
const {MessageEmbed} = require("discord.js");

const function_name = "RapidShard | Temporary Channel"
const version = 0.2;

const check = "868172184152064070";
const cross = "868172332978548736";

// database connection
// let database = mysql.createConnection({
//     host: database_host,
//     port: port,
//     user: database_username,
//     password: database_password,
//     database: database_name
// });


module.exports = {
    name: 'messageReactionAdd',

    async execute(messageReaction, user) {
        if (user.bot) {
            return
        }

        const message = messageReaction.message;
        const guild = message.guild;
        const channel = message.channel;

        return await checkMessageRequest(user, channel, guild, message, messageReaction);
    }
}

// check if the reaction is a message request handler
async function checkMessageRequest(user, channel, guild, message, messageReaction) {

    database.query("SELECT * FROM requestJoinChannel", async function (err, result, fields) {
        if (err) throw err;

        for (let i = 0; i < result.length; i++) {

            if (result[i].channelOwnerId === user.id && result[i].embedReceiver === message.id) {
                const roleId = result[i].roleId;
                const embedReceiver = result[i].embedReceiver;
                const embedSender = result[i].embedSender;
                const requesterId = result[i].requesterId;
                const channelRequestId = result[i].channelRequestId;
                const voiceChannelId = result[i].voiceChannelId;
                const textChannelId = result[i].textChannelId;
                return await requestHandler(messageReaction, roleId, embedReceiver, embedSender, requesterId, channel, guild, channelRequestId, voiceChannelId, textChannelId);
            }
        }
    });
}

// grant or reject requests
async function requestHandler(messageReaction, roleId, embedReceiver, embedSender, requesterId, channel, guild, channelRequestId, voiceChannelId, textChannelId){
    const role = guild.roles.cache.get(roleId);
    const channelRequest = guild.channels.cache.get(channelRequestId);
    const messageReceiver = channel.messages.cache.get(embedReceiver);
    const messageSender = channelRequest.messages.cache.get(embedSender);
    const member = guild.members.cache.get(requesterId);
    const voiceChannel = guild.channels.cache.get(voiceChannelId);
    const textChannel = guild.channels.cache.get(textChannelId);



    if (messageReaction.emoji.id === check) {


        await member.roles.add(role);
        await acceptedEmbedReceiver(member, messageReceiver);
        await acceptedEmbedSender(member, messageSender, voiceChannel, textChannel);

        let sql = `DELETE FROM requestJoinChannel WHERE roleId = ${roleId} AND embedSender = ${embedSender}`;
        database.query(sql, function (err, result) {
            if (err) throw err;
        });
        console.log(`${dayjs()}: 1 request removed.`);

    } else if (messageReaction.emoji.id === cross) {

        await rejectedEmbedReceiver(member, messageReceiver);
        await rejectedEmbedSender(member, messageSender);

        let sql = `DELETE FROM requestJoinChannel WHERE roleId = ${roleId} AND embedSender = ${embedSender}`;
        database.query(sql, function (err, result) {
            if (err) throw err;
        });
        console.log(`${dayjs()}: 1 request removed.`);
    }
}

//embed for when the owner has accepted to receiver
async function acceptedEmbedReceiver(member, message) {
    const accept = new MessageEmbed()
        .setColor("#5bc04c")
        .setTitle(`${member.user.username}#${member.user.discriminator} has been granted permission to join this room.`)
        .setFooter(`${function_name} ${version}`);
    await message.edit({embeds: [accept]});
    return await message.reactions.removeAll();
}

//embed for when the owner has accepted to sender
async function acceptedEmbedSender(member, message, voiceChannel, textChannel) {
    const accept = new MessageEmbed()
        .setColor("#5bc04c")
        .setTitle(`${member.user.username}#${member.user.discriminator} you've been granted permission to join the room.`)
        .setDescription(`${voiceChannel} ${textChannel}`)
        .setFooter(`${function_name} ${version}`);
    await message.edit({embeds: [accept]});
}

//embed for when the owner has accepted to sender
async function rejectedEmbedReceiver(member, message) {
    const reject = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`${member.user.username}#${member.user.discriminator}'s request has been denied.`)
        .setFooter(`${function_name} ${version}`);
    await message.edit({embeds: [reject]});
    return await message.reactions.removeAll();
}

//embed for when the owner has accepted to sender
async function rejectedEmbedSender(member, message) {
    const reject = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`${member.user.username}#${member.user.discriminator} your request has been denied.`)
        .setFooter(`${function_name} ${version}`);
    return await message.edit({embeds: [reject]});
}

