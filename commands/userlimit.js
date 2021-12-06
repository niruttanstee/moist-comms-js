/*
 * temporaryChannel userLimit
 * Allow owner of temporary voice channel to set userLimit.
 */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const mysql = require('mysql');
const wait = require('util').promisify(setTimeout);
const dayjs = require('dayjs');


const function_name = "RapidShard | Temporary Channel"
const version = 0.1;

// mysql info
const {database_host, port, database_username, database_password, database_name} = require("../database.json");

module.exports = {

    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('Get info about a user or a server!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('userlimit')
                .setDescription('User limit')),

    async execute(interaction) {

        const userLimit = interaction.options.getNumber('user limit');
        const channel = interaction.channel;
        const guild = interaction.guild;
        const member = interaction.member;
        console.log(`${dayjs()}: ${member.displayName} initiated set userLimit.`);

        // check if user owns the channel they are in
        if (checkUser) {
            // sets user limit
            await setUserLimit(voice, userLimit);
        } else {
            return await notOwnChannel(interaction);
        }

    }
};

/*
 * check user belonging to the channel
 * @param member
 * @param channel
 * @param guild
 */
async function checkUser(member, channel, guild) {

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

    database.query("SELECT * FROM temporaryChannelLive", async function (err, result, fields) {
        if (err) throw err;

        for (let i = 0; i < result.length; i++) {

            if (result[i].guildId === guild.id && result[i].voiceChannelId === channel.id && result[i].ownerId === member.id) {
                console.log(`${dayjs()}: ${member.displayName} user owns the channel.`);
                return true;
            }
        }
        return false;
    });
}

//the embed posted when a text channel is created
async function notOwnChannel(interaction) {
    const notOwn = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`Only the owner of this channel can change the userlimit.`)
        .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [notOwn]});
}

//set voice channel
async function setUserLimit(interaction, userLimit) {

    const channel = interaction.channel;
    const member = interaction.member;

    if (0 < userLimit < 100) {

        channel.setUserLimit(userLimit)
        .then()
        .catch(console.error);

        console.log(`${dayjs()}: ${member.displayName} has changed their channel user limit to ${userLimit}.`)
        await success(interaction, userLimit);

    } else {
        await failed(interaction);
    }
}
//the embed posted when success
async function success(interaction, userLimit) {
    const done = new MessageEmbed()
        .setColor("#5bc04c")
        .setTitle(`User limit has been changed to (${userLimit})`)
        .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [done]});
}
//the embed posted when success
async function failed(interaction) {
    const fail = new MessageEmbed()
        .setColor("#da4747")
        .setTitle(`User limit has failed to change.`)
        .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [fail]});
}