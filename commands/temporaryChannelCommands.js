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
const version = 0.1;

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
        .setName('set')
        .setDescription('Settings for temporary channel.')
        .setDefaultPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('userlimit')
                .setDescription('Sets the user limit of your temporary voice channel.')
                .addNumberOption(option => option.setName('number').setDescription('The number of user(s) 0-99.').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('owner')
                .setDescription('Transfer temporary channel ownership to someone else.')
                .addUserOption(option => option.setName('user').setDescription('The user to give ownership.').setRequired(true))),

    async execute(interaction) {

        // initialise all variables
        const channel = interaction.channel;
        const guild = interaction.guild;
        const member = interaction.member;

        if (interaction.options.getSubcommand() === 'userlimit') {
            console.log(`${dayjs()}: ${member.displayName} initiated tempchannel userLimit.`);
            const userLimit = interaction.options.getNumber('number');
            // check if user owns the channel they are in
            await checkUser(member, channel, guild, userLimit, interaction);
        } else if (interaction.options.getSubcommand() === 'owner') {
            console.log(`${dayjs()}: ${member.displayName} initiated tempchannel giveOwnership.`);
            const user = interaction.options.getUser('user');

            if (user === interaction.user) {
                await alreadyOwner(interaction);
            } else {
                await giveOwnership(user, interaction);
            }

        }
    }
};

/* userLimit
 * check user belonging to the channel
 * @param member
 * @param channel
 * @param guild
 */
async function checkUser(member, channel, guild, userLimit, interaction) {

    database.query("SELECT * FROM temporaryChannelLive", async function (err, result, fields) {
        if (err) throw err;

        for (let i = 0; i < result.length; i++) {

            if (result[i].guildId === guild.id && result[i].textChannelId === channel.id && result[i].ownerId === member.id) {
                console.log(`${dayjs()}: ${member.displayName} owns the channel, changing.`);
                const voiceChannelID = result[i].voiceChannelId;
                let voiceChannel = guild.channels.cache.get(voiceChannelID);
                return await setUserLimit(voiceChannel, userLimit, interaction);

            }
        }
        return await notOwnChannel(interaction);
    });

}

//the embed posted when user does not own the text channel.
async function notOwnChannel(interaction) {
    const notOwn = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`Only the owner of this channel can customise it.`)
        .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [notOwn]});
}

//set voice channel
async function setUserLimit(voiceChannel, userLimit, interaction) {

    const member = interaction.member;

    if (userLimit >= 0 && userLimit < 100) {

        voiceChannel.setUserLimit(userLimit)
        .then()
        .catch(console.error);

        console.log(`${dayjs()}: ${member.displayName} has changed their channel user limit to ${userLimit}.`)
        await userLimitSuccess(interaction, userLimit);

    } else {
        await userLimitFail(interaction);
    }
}
//the embed posted when success
async function userLimitSuccess(interaction, userLimit) {
    const done = new MessageEmbed()
        .setColor("#5bc04c")
        .setTitle(`User limit has been changed to (${userLimit})`)
        .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [done]});
}
//the embed posted when fail
async function userLimitFail(interaction) {
    const fail = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`Userlimit parameter not within (0-99)`)
        .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [fail]});
}

/* giveOwnership
 * gives ownership to another user
 * @param userID
 * @param interaction
*/
async function giveOwnership(newOwner, interaction) {
    database.query("SELECT * FROM temporaryChannelLive", async function (err, result, fields) {
        if (err) throw err;

        const guild = interaction.guild;
        const channel = interaction.channel;
        const user = interaction.user;

        for (let i = 0; i < result.length; i++) {

            if (result[i].guildId === guild.id && result[i].textChannelId === channel.id && result[i].ownerId === user.id) {
                console.log(`${dayjs()}: ${user.displayName} owns the channel, changing.`);
                const textChannelId = result[i].textChannelId;
                
                let sql = `UPDATE temporaryChannelLive SET ownerId = ${newOwner.id} WHERE textChannelId = ${textChannelId}`;
                database.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log(`${dayjs()}: tempchannel ownership updated.`);
                    }
                );

                return successOwnership(newOwner, interaction);

            }
        }
        return await notOwnChannel(interaction);
    });
}
//the embed posted when fail
async function alreadyOwner(interaction) {
    const fail = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`You're already the owner of this channel.`)
        .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [fail]});
}
// success embed for changing ownership of temporary channels
async function successOwnership(user, interaction) {
    const done = new MessageEmbed()
    .setColor("#5bc04c")
    .setTitle(`Ownership transfer successful`)
    .setDescription(`${user} now owns this temporary channel.`)
    .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [done]});
}