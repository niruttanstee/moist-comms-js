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

        console.log(`${dayjs()}: ${member.displayName} initiated redeemable creation command.`);

        await startup(interaction);
        const mention = await getMention(member, channel, guild);
        if (mention) {
            let gameName = await getGameName(member, channel, guild);
        }
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
            const allRoles = await guild.roles.fetch()
                .then((roles) => {
                    return roles;
                });
            for (let key of allRoles.keys()) {
                if (`<@&${key}>` === response.content) {
                    return key;
                }
            }
            await error(channel, `The mention is not recognised. (${i}/5)`);
        }
         catch {
            // catch timeout error
            await error(channel, "Timed out. Please try again.");
            return false;
         }
    }
    // catch ran out of tries
    await error(channel, "You ran out of tries.");
    return false;
}
/*
getGameName function gets the game name from the user.
@param member, channel, guild
@return boolean (if function is filled)
@return mention information
*/
async function getGameName(member, channel, guild) {
    await getGameNameEmbed(channel);
    // for (let i = 1; i <= 5; i++) {
    //     const filter = m => m.author.id === member.id && m.channel.id === channel.id;
    //     try {
    //         const collected = await channel.awaitMessages({filter, max: 1, time: 60_000});
    //         const response = collected.first();
    //         const allRoles = await guild.roles.fetch()
    //             .then((roles) => {
    //                 return roles;
    //             });
    //         for (let key of allRoles.keys()) {
    //             if (`<@&${key}>` === response.content) {
    //                 return true;
    //             }
    //         }
    //         await error(channel, `The mention is not recognised. (${i}/5)`);
    //     }
    //     catch {
    //         // catch timeout error
    //         await error(channel, "Timed out. Please try again.");
    //         return false;
    //     }
    // }
    // // catch ran out of tries
    // await error(channel, "You ran out of tries.");
    // return false;
}

// embed to let user that called command know that the steps will be taken via private message
async function startup(interaction) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setTitle(`0. Redeemable creation function enabled.`)
        .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [debug]});
}

// embed for get mention intro
async function getMentionEmbed(channel) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setTitle(`1. Please enter a relevant mention.`)
        .setDescription(`The mention will be posted with the redeemable post to notify users of the giveaway.` +
        ` For example, if the redeemable is for the game **Battlefield**, use the mention <@&861274021064736768>\n\n` + 
        `If a mention is unavailable, use the mention <@&869537874314420264>`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}

// embed for get game title
async function getGameNameEmbed(channel) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setTitle(`2. What game is this for?`)
        .setDescription(`Provide the name of the game that this redeemable is dedicated to. Try and use the official naming, for example:\n` +
            `**Call of Duty: Warzone, Minecraft Java Edition, New World...**`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}

//embed error
async function error(channel, problem) {
    const debug = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`Error: ${problem}`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}