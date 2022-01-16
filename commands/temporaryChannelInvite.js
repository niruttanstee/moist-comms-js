const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions} = require("discord.js");
const dayjs = require('dayjs');
const mysql = require('mysql');

const function_name = "RapidShard | Temporary Channel"
const version = 0.2;

// const {database_host, port, database_username, database_password, database_name} = require("../database.json");
const {verifiedRoleID, staffID} = require("../guild.json")

// database connection
// let database = mysql.createConnection({
//     host: database_host,
//     port: port,
//     user: database_username,
//     password: database_password,
//     database: database_name
// });

database.connect(function (err) {
    if (err) throw err;
});

module.exports = {

    data: new SlashCommandBuilder()
        .setName('grant')
        .setDescription('Grant permission to a user to join your locked temporary channel.')
        .setDefaultPermission(true)
        .addUserOption(option => option.setName('user').setDescription('The user to grant permission.').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        /*
        Executes a function to check if the user:
        1. has a temporary channel. DONE
        1.1 temporary channel not locked. DONE
        2. is not granting themselves. DONE
        3. if the user granting already have the role.
        Then, if all parameters meet, grant role permission and send confirmation message.
        Otherwise, send failed message.
         */
        const targetMember = interaction.options.getUser('user');
        const member = interaction.member;
        const channel = interaction.channel;
        const guild = interaction.guild;
        if (member.id === targetMember.id) {
            return await error(interaction, "You can't grant permission to yourself.")
        }

        database.query("SELECT * FROM temporaryChannelLive", async function (err, result, fields) {
            if (err) throw err;
            for (let i = 0; i < result.length; i++) {
                if (guild.id === result[i].guildId && member.id === result[i].ownerId && channel.id === result[i].textChannelId) {
                    if (result[i].lockedChannelRoleId === "0") {
                        return await error(interaction, "Channel is not locked.")
                    } else {
                        const role = guild.roles.cache.get(result[i].lockedChannelRoleId);
                        const log = role.members;
                        for (let key of log.keys()) {
                            if (key === targetMember.id) {
                                return await error(interaction, "User already has permission to join the channel.")
                            }
                        }

                        try {
                            const user = guild.members.cache.get(targetMember.id);
                            await user.roles.add(role);
                        }catch (e) {console.log(e)}

                        const voiceChannel = guild.channels.cache.get(result[i].voiceChannelId)
                        const textChannel = guild.channels.cache.get(result[i].textChannelId)
                        await successMember(interaction, member, targetMember,voiceChannel, textChannel);
                        return await successOwner(interaction, targetMember);
                    }
                } else if (guild.id === result[i].guildId && member.id === result[i].ownerId && channel.id !== result[i].textChannelId) {
                    return await error(interaction, "Command not entered in your text channel.")
                }
            }
            return await error(interaction, "You don't own a temporary channel.")
        });
    }
}

//embed error
async function error(interaction, problem) {
    const debug = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`Error: ${problem}`)
        .setFooter(`${function_name} ${version}`);
    await interaction.editReply({embeds: [debug]});
}
//embed success to granted person
async function successMember(interaction, member, targetMember, voiceChannel, textChannel) {
    const debug = new MessageEmbed()
        .setColor("#5bc04c")
        .setTitle(`${member.user.username}#${member.user.discriminator} has granted you permission to join their room.`)
        .setDescription(`${voiceChannel} ${textChannel}`)
        .setFooter(`${function_name} ${version}`);
    await targetMember.send({embeds: [debug]});
}

//embed success
async function successOwner(interaction, member) {
    const debug = new MessageEmbed()
        .setColor("#5bc04c")
        .setTitle(`Permission granted to ${member.username}#${member.discriminator}.`)
        .setFooter(`${function_name} ${version}`);
    console.log(`${dayjs()}: Grant permission to initiated.`);
    await interaction.editReply({embeds: [debug]});
}