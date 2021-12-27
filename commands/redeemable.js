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

        await mention(interaction);
        return await startup(interaction);


        // Mention
            // Title maker Max 50 Words
                // Credit @name
                    // Add image link if want
                        // add serial key
                            // add date of giveaway
        // confirm otherwise
    }
};

// embed to let user that called command know that the steps will be taken via private message
async function startup(interaction) {
    const debug = new MessageEmbed()
        .setColor("#eecb1d")
        .setTitle(`Please respond to a message sent to your inbox.`)
        .setFooter(`${function_name} ${version}`);
    await interaction.reply({embeds: [debug]});
}

async function mention(interaction) {
    const user = interaction.user;
    const debug = new MessageEmbed()
        .setColor("#eecb1d")
        .setTitle(`Hello`)
        .setFooter(`${function_name} ${version}`);
    await user.send({embeds: [debug]});
}