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
const mysql = require('mysql');
const wait = require('util').promisify(setTimeout);
const dayjs = require('dayjs');

// mysql info
const {database_host, port, database_username, database_password, database_name} = require("../database.json");

module.exports = {

    data: new SlashCommandBuilder()
        .setName('tempchannel')
        .setDescription('Temporary channel function.')
        .setDefaultPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup temporary channel.')),

    async execute(interaction) {

        const channel = interaction.channel;
        const guild = interaction.guild;
        const member = interaction.member;
        console.log(`${dayjs()}: ${member.displayName} initiated Temporary Channel Setup.`);

        if (await startup(channel, guild)){
        }


        //setup stage: ask for setup confirmation
        async function startup(channel, guild) {
            const startupEmbed = new MessageEmbed()
                .setColor("#3288de")
                .setTitle(`Function loading...`)

            await interaction.reply({ embeds: [startupEmbed]})
                .then(await tempchannelSetup(channel, guild, member))
                .catch(console.error);

        async function tempchannelSetup(channel, guild, member){

            const setupEmbed = new MessageEmbed()
                .setColor("#3288de")
                .setTitle(`(1) Temporary Channel Setup`)
                .setDescription(`The setup process is ready to start.\n\nIf you’ve already setup the temporary channel before, your previous progress will be lost.\n\n👉 **Do you wish to continue?**`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setFooter('RapidShard | Temporary Channel Version 0.1');
            await wait(1000);
            const message = await channel.send({ embeds: [setupEmbed]});

            // mysql connection and upload
            let database = mysql.createConnection({
                host: database_host,
                port: port,
                user: database_username,
                password: database_password,
                database: database_name
            });


            // check if database exist for this guild
            database.connect(function(err) {
                if (err) throw err;
                console.log(`${dayjs()}: Database connected.`);
            });
            database.query("SELECT * FROM temporaryChannelProperties", function (err, result, fields){
                if (err) throw err;
                for (let i = 0; i < result.length; i++) {
                    if (result[i].guildID === guild.id){
                        let sql = `UPDATE temporaryChannelProperties SET setupMessageID = (${message.id}) WHERE guildID = (${guild.id})`;
                        database.query(sql, function(err, result) {
                            if (err) throw err;
                        });
                        return console.log(`${dayjs()}: 1 record updated.`);
                    }
                }
                let sql = `INSERT INTO temporaryChannelProperties (guildID, setupMessageID, ownerUserID) VALUES (${guild.id}, ${message.id}, ${member.id})`;
                database.query(sql, function(err, result) {
                    if (err) throw err;
                });
                return console.log(`${dayjs()}: 1 record inserted.`);
            });

            // add reactions for the embed message
            await message.react(message.guild.emojis.cache.get('868172184152064070'));
            await wait(500);
            await message.react(message.guild.emojis.cache.get('868172332978548736'));


        }

        }
    }, getVoiceCategory
};

//get voice categoryID
async function getVoiceCategory(channel, user) {
    console.log()

    const getVoiceCategoryEmbed = new MessageEmbed()
        .setColor("#3288de")
        .setTitle(`Respond test`)
    const message = await channel.send({ embeds: [getVoiceCategoryEmbed]});

    const filter = m => m.author.id === user.id;
    const collector = channel.createMessageCollector({ filter, time: 15_000 });
    collector.on('collect', async m => await test(m.content, user, channel));
    collector.on('end',  async collected => {
        if (collected.size === 0) {
            await channel.send("Timeout")
        }
    });


}
async function test(content, user, channel){
    console.log(content)
}