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
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const wait = require('util').promisify(setTimeout);
const dayjs = require('dayjs');
const mysql = require('mysql');

const function_name = "RapidShard | Temporary Channel"
const version = 0.2;

const {database_host, port, database_username, database_password, database_name} = require("../database.json");

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
                console.log(`${dayjs()}: ${member.displayName} owns the channel, changing.`);
                const voiceChannelID = result[i].voiceChannelId;
                const textChannelID = result[i].textChannelId;
                let voiceChannel = guild.channels.cache.get(voiceChannelID);
                let textChannel = guild.channels.cache.get(textChannelID);

                return await lockChannel(member, guild, voiceChannel, textChannel, interaction);
            }
        }
        return await notOwnChannel(interaction);
    });
}

// give user role and lock channel
async function lockChannel(member, guild, voiceChannel, textChannel, interaction) {
    let lockedChannelPermissionName = `Channel: ${voiceChannel.name}`;
    role = guild.roles.create({
        name: `${lockedChannelPermissionName}`,
        color: 'BLUE'
    }).then( role => {
        interaction.reply(`${role}`)
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