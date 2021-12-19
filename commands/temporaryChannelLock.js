/*
 * Lock channel and give user permissions.
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
        .setName('lock')
        .setDescription('Lock your temporary channel.')
        .setDefaultPermission(true),
            
    async execute(interaction) {

        let member = interaction.member;
        let channel = interaction.channel;
        let guild = interaction.guild; 
        // create a new role and give it to user
        return await checkUser(member, channel, guild, interaction);


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
                    return await lockChannel(member, guild, voiceChannel, textChannel, lockedChannelRoleID, interaction);
                } else {
                    return await alreadyLocked(interaction);
                }

            }
        }
        return await notOwnChannel(interaction);
    });
}

// give user role and lock channel
async function lockChannel(member, guild, voiceChannel, textChannel, roleID, interaction) {
    let lockedChannelPermissionName = `Channel: ${voiceChannel.name}`;
    guild.roles.create({
        name: `${lockedChannelPermissionName}`,
        color: "#fdf238"
    }).then( async role => {

        // permissions overwrite
        await member.roles.add(role);

        await voiceChannel.permissionOverwrites.set([
            {
                id: verifiedRoleID,
                deny: [Permissions.FLAGS.CONNECT, Permissions.FLAGS.VIEW_CHANNEL],
            },
            {
                id: staffID,
                deny: [Permissions.FLAGS.CONNECT, Permissions.FLAGS.VIEW_CHANNEL],
            },
            {
                id: guild.id,
                deny: [Permissions.FLAGS.CONNECT, Permissions.FLAGS.VIEW_CHANNEL],
            },
            {
                id: role.id,
                allow: [Permissions.FLAGS.CONNECT, Permissions.FLAGS.VIEW_CHANNEL],
            }
        ]);

        await textChannel.permissionOverwrites.set([
            {
                id: verifiedRoleID,
                deny: [Permissions.FLAGS.READ_MESSAGE_HISTORY, Permissions.FLAGS.VIEW_CHANNEL],
            },
            {
                id: staffID,
                deny: [Permissions.FLAGS.READ_MESSAGE_HISTORY, Permissions.FLAGS.VIEW_CHANNEL],
            },
            {
                id: guild.id,
                deny: [Permissions.FLAGS.CONNECT, Permissions.FLAGS.VIEW_CHANNEL],
            },
            {
                id: role.id,
                allow: [Permissions.FLAGS.READ_MESSAGE_HISTORY, Permissions.FLAGS.VIEW_CHANNEL],
            }
        ]);

        let sql = `UPDATE temporaryChannelLive
                           SET lockedChannelRoleId = ${role.id}
                           WHERE ownerId = ${member.id}`;
        database.query(sql, function (err, result) {
            if (err) throw err;
            console.log(`${dayjs()}: lockedChannelRoleId record updated.`);
        });

        return await lockedChannelEmbed(interaction);
    })
    .catch(console.error);
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
async function alreadyLocked(interaction) {
    const locked = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`Channel is already locked.`)
        .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [locked]});
}

//the embed posted when lock successful.
async function lockedChannelEmbed(interaction) {
    const locked = new MessageEmbed()
        .setColor("#3288de")
        .setTitle(`Channel is now locked.`)
        .setFooter(`${function_name} ${version}`);
    console.log(`${dayjs()}: ${interaction.member.displayName} has locked their channel.`);
    await interaction.reply({embeds: [locked]});
}