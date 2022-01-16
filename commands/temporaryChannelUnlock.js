/*
 * Unlock channel and give user permissions.
 */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require("discord.js");
const dayjs = require('dayjs');
const { pool } = require("../db");

const function_name = "RapidShard | Temporary Channel"
const version = 0.2;
const {verifiedRoleID, staffID} = require("../guild.json")

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

    }
}

// check if the user is the owner
async function checkUser(member, channel, guild, interaction) {

    pool.query(`SELECT * FROM "temporaryChannelLive"`, async function (err, result, fields) {
        if (err) throw err;

        for (let i = 0; i < result.rows.length; i++) {

            if (result.rows[i].guildId === guild.id && result.rows[i].textChannelId === channel.id && result.rows[i].ownerId === member.id) {
                const voiceChannelID = result.rows[i].voiceChannelId;
                const textChannelID = result.rows[i].textChannelId;
                const lockedChannelRoleID = result.rows[i].lockedChannelRoleId;
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
async function unlockChannel(member, guild, voiceChannel, textChannel, lockedChannelRoleID, interaction) {


    let role = guild.roles.cache.get(lockedChannelRoleID);

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
    await pool.query(`UPDATE "temporaryChannelLive" SET "lockedChannelRoleId" = $1 WHERE "ownerId" = $2`, [0, member.id,]);
        console.log(`${dayjs()}: lockedChannelRoleId record updated.`);
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