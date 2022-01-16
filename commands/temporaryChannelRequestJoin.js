/*
 * Lock channel and give user permissions.
 */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require("discord.js");
const dayjs = require('dayjs');
const mysql = require('mysql');

const function_name = "RapidShard | Temporary Channel"
const version = 0.2;
const wait = require('util').promisify(setTimeout);


// const {database_host, port, database_username, database_password, database_name} = require("../database.json");
const {verifiedRoleID, staffID} = require("../guild.json");
const e = require('express');
const { user } = require('pg/lib/defaults');

// database connection
// let database = mysql.createConnection({
//     host: database_host,
//     port: port,
//     user: database_username,
//     password: database_password,
//     database: database_name
// });

database.connect(function (err) {
    if (err) throw err;
});

module.exports = {

    data: new SlashCommandBuilder()
        .setName('request')
        .setDescription('Request to join a locked temporary channel.')
        .setDefaultPermission(true)
        .addSubcommand(subcommand =>
            subcommand
                .setName('join')
                .setDescription('Request to join a locked temporary channel.')
                .addUserOption(option => option.setName('owner').setDescription('The channel owner to request.').setRequired(true))),
            
    async execute(interaction) {
        const owner = interaction.options.getUser('owner');
        const member = interaction.member;
        const guild = interaction.guild;
        return await checkExist(member, owner, guild, interaction);
    }
};

// check if the temporary channel exist
async function checkExist(member, owner, guild, interaction) {
    database.query("SELECT * FROM temporaryChannelLive", async function (err, result, fields) {
        if (err) throw err;

        for (let i = 0; i < result.length; i++) {

            if (result[i].ownerId === owner.id && result[i].ownerId !== member.id && result[i].guildId === guild.id && result[i].lockedChannelRoleId !== '0') {
                // all parameters meet
                const roleId = result[i].lockedChannelRoleId;
                const textChannelId = result[i].textChannelId;
                const voiceChannelId = result[i].voiceChannelId;

                const role = guild.roles.cache.get(roleId);
                const log = role.members;
                for (let key of log.keys()) {
                    if (key === member.id) {
                        return await error(interaction, "You already have permission to join the channel.")
                    }
                }
                return await pendingCheck(member, owner, guild, interaction, roleId, textChannelId, voiceChannelId);

            } else if (result[i].ownerId === owner.id && result[i].guildId === guild.id && owner.id === member.id){
                //channel requested is your own
               return await error(interaction, "Can't request to join your own channel.");
            } else if (result[i].ownerId === owner.id && result[i].guildId === guild.id && result[i].lockedChannelRoleId === '0') {
                //channel is not locked
               return await error(interaction, "Channel requesting isn't locked.");
            }
        }
        return await error(interaction, "Channel requested does not exist.");

    });
}
// pending checker
async function pendingCheck(member, owner, guild, interaction, roleId, textChannelId, voiceChannelId) {
    database.query("SELECT * FROM requestJoinChannel", async function (err, result, fields) {
        if (err) throw err;

        for (let i = 0; i < result.length; i++) {
            if (result[i].roleId === roleId && result[i].channelOwnerId === owner.id && result[i].requesterId === member.id && result[i].status === 1) {
                return await error(interaction, "You already have a pending request for this room.");
            }
        }
        return await requestSend(owner, member, roleId, textChannelId, voiceChannelId, guild, interaction);
    });
}

// send the request
async function requestSend(owner, member, roleId, textChannelId, voiceChannelId, guild, interaction) {
    // status: 1 pending, 2 accepted, 3 rejected
    const textChannel = guild.channels.cache.get(textChannelId);
    const embedReceiver = await receiverEmbed(owner, member, textChannel, interaction);
    const embedSender = await senderEmbed(owner, member, interaction);

    let sql = `INSERT INTO requestJoinChannel (embedSender, embedReceiver, status, roleId, channelOwnerId, requesterId, channelRequestId, voiceChannelId, textChannelId) 
    VALUES (${embedSender.id}, ${embedReceiver.id}, 1, ${roleId}, ${owner.id}, ${member.id}, ${interaction.channel.id}, ${voiceChannelId}, ${textChannelId})`;
    database.query(sql, function(err, result) {
        if (err) throw err;
    });
    console.log(`${dayjs()}: 1 request inserted.`);

    // wait 2 minutes before timing out the request
    await wait(120000)

    database.query("SELECT * FROM requestJoinChannel", async function (err, result, fields) {
        if (err) throw err;

        for (let i = 0; i < result.length; i++) {
            if (result[i].roleId === roleId && result[i].channelOwnerId === owner.id && result[i].requesterId === member.id && result[i].status === 1) {
                await senderTimeoutEmbed(owner, interaction, embedSender)
                await receiverTimeoutEmbed(member, interaction, embedReceiver)

                let sql = `DELETE FROM requestJoinChannel WHERE roleId = ${roleId}`;
                database.query(sql, function (err, result) {
                    if (err) throw err;
                });
                console.log(`${dayjs()}: 1 pending request removed.`);
            }
        }
    });
}

async function receiverEmbed(owner, member, textChannel, interaction) {
    await interaction.deferReply();
    const receive = new MessageEmbed()
        .setColor("#eecb1d")
        .setTitle(`${member.user.username}#${member.user.discriminator} has requested to join this room.`)
        .setFooter(`${function_name} ${version}`);
    const message = await textChannel.send({embeds: [receive]});
    await message.react(message.guild.emojis.cache.get('868172184152064070'));
    await message.react(message.guild.emojis.cache.get('868172332978548736'));
    return message;
}

async function senderEmbed(owner, member, interaction) {
    const receive = new MessageEmbed()
        .setColor("#eecb1d")
        .setTitle(`Waiting for a response from ${owner.username}#${owner.discriminator}.`)
        .setFooter(`${function_name} ${version}`);
    return await interaction.editReply({embeds: [receive]});
}

//embed error
async function error(interaction, problem) {
    const debug = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`Error: ${problem}`)
        .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [debug]});
}
// embed for sender timeout
async function senderTimeoutEmbed(owner, interaction, message) {
    const timeout = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`Pending request timed out`)
        .setDescription(`Your request to join **${owner.username}'s room** has timed out. There's a chance that they didn't see it, try again.`)
        .setFooter(`${function_name} ${version}`);
    await message.edit({embeds: [timeout]});
}

// embed for receiver time out
async function receiverTimeoutEmbed(member, interaction, message) {
    const timeout = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`Pending request timed out`)
        .setDescription(`You've ran out of time to respond to **${member.user.username}'s** request to join this room.`)
        .setFooter(`${function_name} ${version}`);
    await message.edit({embeds: [timeout]});
    await message.reactions.removeAll();
}

