/*
 * Unlock channel and give user permissions.
 */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require("discord.js");
const dayjs = require('dayjs');
const mysql = require('mysql');

const function_name = "RapidShard | Temporary Channel"
const version = 0.2;

const {database_host, port, database_username, database_password, database_name} = require("../database.json");
const {verifiedRoleID, staffID} = require("../guild.json")

// database connection
let database = mysql.createConnection({
    host: database_host,
    port: port,
    user: database_username,
    password: database_password,
    database: database_name
});

database.connect(function (err) {
    if (err) throw err;
});

module.exports = {

    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock your temporary channel.')
        .setDefaultPermission(true),
            
    async execute(interaction) {

        let member = interaction.member;
        let channel = interaction.channel;
        let guild = interaction.guild; 
        // create a new role and give it to user
        return await checkUser(member, channel, guild, interaction);

        // lock voice channel with join permission only for that user


        // lock text channel with read permission only for that user


    }
}

// check if the user is the owner
async function checkUser(member, channel, guild, interaction) {

    database.query("SELECT * FROM temporaryChannelLive", async function (err, result, fields) {
        if (err) throw err;

        for (let i = 0; i < result.length; i++) {

            if (result[i].guildId === guild.id && result[i].textChannelId === channel.id && result[i].ownerId === member.id) {
                const voiceChannelID = result[i].voiceChannelId;
                const textChannelID = result[i].textChannelId;
                const lockedChannelRoleID = result[i].lockedChannelRoleId;
                let voiceChannel = guild.channels.cache.get(voiceChannelID);
                let textChannel = guild.channels.cache.get(textChannelID);

                if (lockedChannelRoleID === '0') {
                    return await alreadyUnlocked(interaction);
                } else {
                    return await unlockChannel(member, guild, voiceChannel, textChannel, lockedChannelRoleID, interaction);
                }
            }
        }
        return await notOwnChannel(interaction);
    });
}

// give user role and lock channel
async function unlockChannel(member, guild, voiceChannel, textChannel, roleID, interaction) {


    let role = guild.roles.cache.get(roleID);
    await role.delete();

    // permissions overwrite

    await voiceChannel.permissionOverwrites.set([
        {
            id: verifiedRoleID,
            Default: [Permissions.FLAGS.CONNECT, Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
            id: staffID,
            Default: [Permissions.FLAGS.CONNECT, Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
            id: guild.id,
            Default: [Permissions.FLAGS.CONNECT, Permissions.FLAGS.VIEW_CHANNEL],
        },
    ]);

    await textChannel.permissionOverwrites.set([
        {
            id: verifiedRoleID,
            Default: [Permissions.FLAGS.READ_MESSAGE_HISTORY, Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
            id: staffID,
            Default: [Permissions.FLAGS.READ_MESSAGE_HISTORY, Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
            id: guild.id,
            Default: [Permissions.FLAGS.CONNECT, Permissions.FLAGS.VIEW_CHANNEL],
        },
    ]);

    let sql = `UPDATE temporaryChannelLive
                           SET lockedChannelRoleId = 0
                           WHERE ownerId = ${member.id}`;
    database.query(sql, function (err, result) {
        if (err) throw err;
        console.log(`${dayjs()}: lockedChannelRoleId record updated.`);
    });

    return await unlockedChannelEmbed(interaction);

}

//the embed posted when user does not own the text channel.
async function notOwnChannel(interaction) {
    const notOwn = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`Only the owner of this channel can customise it.`)
        .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [notOwn]});
}

//the embed posted when channel is already unlocked.
async function alreadyUnlocked(interaction) {
    const unlocked = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`Channel is already unlocked.`)
        .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [unlocked]});
}

//the embed posted when lock successful.
async function unlockedChannelEmbed(interaction) {
    const unlocked = new MessageEmbed()
        .setColor("#3288de")
        .setTitle(`Channel is now unlocked.`)
        .setFooter(`${function_name} ${version}`);
    console.log(`${dayjs()}: ${interaction.member.displayName} has unlocked their channel.`);
    await interaction.reply({embeds: [unlocked]});
}