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
const { pool } = require("../db");


const function_name = "RapidShard | Temporary Channel"
const version = 0.2;

module.exports = {

    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Temporary channel function.')
        .setDefaultPermission(true)
        .addSubcommand(subcommand =>
            subcommand
                .setName('commands')
                .setDescription('All available commands for temporary channel.')),

    async execute(interaction) {

        // initialise all variables
        const channel = interaction.channel;
        const guild = interaction.guild;
        const member = interaction.member;
        console.log(`${dayjs()}: ${member.displayName} initiated tempchannel commands.`);
        return await allCommands(interaction);
        }

};

//Embed of all commands
async function allCommands(interaction) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setTitle("All temporary channel commands")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .addFields(
            { name: "Set name of your channel:", value: "```/set name```", inline: false },
            { name: "Set user limit of your channel:", value: "```/set userlimit```", inline: false },
            { name: "Set new owner of the channel:", value: "```/set owner```", inline: false },
            { name: "Lock your channel:", value: "```/lock```", inline: false },
            { name: "Unlock your channel:", value: "```/unlock```", inline: false },
            { name: "Grant user permission to join locked channel:", value: "```/grant```", inline: false },
            { name: "Request to join a locked channel:", value: "```/request join```", inline: false })
        .setFooter(`${function_name} ${version}`);
    return await interaction.reply({embeds: [debug]});

}