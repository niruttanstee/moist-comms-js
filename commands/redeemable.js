/*
 * Redeemable is a function that creates redeemable digital keys giveaways.
 * Enabling staff to create giveaways with schedules with features:
 * Users react to the message to be in the giveaway pool
 * Uses non-blocking scheduler to RNG giveaway the key
 */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const wait = require('util').promisify(setTimeout);
const dayjs = require('dayjs');
const mysql = require('mysql');

const function_name = "RapidShard | Redeemable"
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
        .setName('create')
        .setDescription('Creation command for RapidShard features.')
        .setDefaultPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('redeemable')
                .setDescription('Create digital redeemable keys giveaway.')),
    async execute(interaction) {
        const member = interaction.member;
        const channel = interaction.channel;
        const guild = interaction.guild;

        // await startup(interaction);
        // if (await getMention(member, channel, guild)){
        //     await channel.send("Process confirm")
        // }



        // Mention
            // Game Name
                // Title maker Max 50 Words
                    // Credit @name
                        // Add image link if want
                            // add serial key
                                // add date of giveaway
        // confirm otherwise
    }
};

/*
getMention function gets the mention game from the user.
@param member, channel, guild
@return boolean (if function is filled)
@return mention information
*/
async function getMention(member, channel, guild) {
    await getMentionEmbed(channel);

    for (let i = 1; i <= 5; i++) {
        const filter = m => m.author.id === member.id && m.channel.id === channel.id;
        try {
            const collected = await channel.awaitMessages({filter, max: 1, time: 60_000});
            const response = collected.first();
            if (response === 0) {
                return true;
            }



        }
         catch {
            // catch timeout error
            return false; 
         }
    }
    return false;
}
    
    


// embed to let user that called command know that the steps will be taken via private message
async function startup(interaction) {
    const debug = new MessageEmbed()
        .setColor("#eecb1d")
        .setTitle(`0. Redeemable creation function enabled.`)
        .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [debug]});
}

// embed for get mention intro
async function getMentionEmbed(channel) {
    const debug = new MessageEmbed()
        .setColor("#eecb1d")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setTitle(`1. Please enter a relevant mention.`)
        .setDescription(`The mention will be posted with the redeemable post to notify users of the giveaway.` +
        ` For example, if the redeemable is for the game **Battlefield**, use the mention <@&861274021064736768>\n\n` + 
        `If a mention is unavailable, use the mention <@&869537874314420264>`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}
