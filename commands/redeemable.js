/*
 * Redeemable is a function that creates redeemable digital keys giveaways.
 * Enabling staff to create giveaways with schedules with features:
 * Users react to the message to be in the giveaway pool
 * Uses non-blocking scheduler to RNG giveaway the key
 */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, DMChannel} = require("discord.js");
const wait = require('util').promisify(setTimeout);
const dayjs = require('dayjs');
const toArray = require('dayjs/plugin/toArray')
dayjs.extend(toArray)

const mysql = require('mysql');

const function_name = "RapidShard | Redeemable"
const version = 0.1;

// const {database_host, port, database_username, database_password, database_name} = require("../database.json");

// database connection
// let database = mysql.createConnection({
//     host: database_host,
//     port: port,
//     user: database_username,
//     password: database_password,
//     database: database_name
// });

// database.connect(function (err) {
//     if (err) throw err;
// });

module.exports = {

    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Creation command for RapidShard features.')
        .setDefaultPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('redeemable')
                .setDescription('Create redeemable of digital key giveaway.')),
    async execute(interaction) {

        const member = interaction.member;
        const channel = interaction.channel;
        const guild = interaction.guild;

        console.log(`${dayjs()}: ${member.displayName} initiated redeemable creation command.`);
        const messageId = await startup(interaction);
        const gameName = await getGameName(member, channel, guild);
        if (gameName) {
            const mention = await getMention(member, channel, guild);
            if (mention) {
                //platform
                const platform = await getPlatform(member, channel, guild);
                if (platform) {
                    const redeemableType = await checkRedeemableType(member, channel, guild);
                    if (redeemableType === 1) {
                        const DlcName = await getDlcName(member, channel, guild);
                        if (DlcName) {
                            const imageLink = await getImage(member, channel, guild);
                            if (imageLink) {
                                const date = await getDate(member, channel, guild);
                                if (date) {
                                    const memberId = member.id;
                                    let sql = `INSERT INTO redeemable VALUES (${messageId}, ${memberId}, '${gameName}', ${mention}, ${redeemableType}, '${DlcName}', '${imageLink}', '${date[0]}', null, ${channel.id}, null, null, null, null, '${platform}', '${date[1]}');`
                                    database.query(sql, function (err, result) {
                                        if (err) throw err;
                                    });
                                    console.log(`${dayjs()}: 1 record inserted.`);
                                    await getSerialKey(member, channel, guild, messageId);
                                }
                            }
                        }
                    }
                    else if (redeemableType === 2) {
                        const imageLink = await getImage(member, channel, guild);
                        if (imageLink) {
                            const date = await getDate(member, channel, guild);
                            if (date) {
                                const memberId = member.id;
                                let sql = `INSERT INTO redeemable VALUES (${messageId}, ${memberId}, '${gameName}', ${mention}, ${redeemableType}, null, '${imageLink}', '${date[0]}', null, ${channel.id}, null, null, null, null, '${platform}', '${date[1]}');`
                                database.query(sql, function (err, result) {
                                    if (err) throw err;
                                });
                                console.log(`${dayjs()}: 1 record inserted.`);
                                await getSerialKey(member, channel, guild, messageId);
                            }
                        }
                    }
                }
            }
        }
    }, getGameName, getMention, checkRedeemableType, getDlcName, getImage, getDate, getSerialKey, eventRemove, addParticipant, getPlatform, removeParticipant
};
/*
getGameName function gets the game name from the user.
@param member, channel, guild
@return boolean (if function is filled)
*/
async function getGameName(member, channel, guild) {
    await getGameNameEmbed(channel);
    for (let i = 1; i <= 5; i++) {
        const filter = m => m.author.id === member.id && m.channel.id === channel.id;
        try {
            const collected = await channel.awaitMessages({filter, max: 1, time: 60_000});
            const response = collected.first()
            const content = response.content;

            if (content.length > 0 && content.length < 35) {
                // success
                if (await hasSymbol(response.content) === false) {
                    await success(channel, `"${content}" confirmed.`)
                    return content.toUpperCase();
                } else {
                    await error(channel, `Unsupported use of symbols. (${i}/5)`)
                }
            } else {
                //too many characters
                await error(channel, `Over 35 characters limit, abbreviate. (${i}/5)`)
            }
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
                    await success(channel, `Mention confirmed.`)
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
getMention function gets the mention game from the user.
@param member, channel, guild
@return boolean (if function is filled)
@return mention information
*/
async function getPlatform(member, channel, guild) {
    await getPlatformEmbed(channel);
    for (let i = 1; i <= 5; i++) {
        const filter = m => m.author.id === member.id && m.channel.id === channel.id;
        try {
            const collected = await channel.awaitMessages({filter, max: 1, time: 60_000});
            const response = collected.first();
            const content = response.content;
            try {
                if (content === "1") {
                    await success(channel, "Confirmed, this redeemable is for PC.")
                    return "PC";
                } else if (content === "2") {
                    await success(channel, "Confirmed, this redeemable is for Playstation / PSN.")
                    return "Playstation / PSN";
                } else if (content === "3") {
                    await success(channel, "Confirmed, this redeemable is for Xbox.")
                    return "Xbox";
                } else if (content === "4") {
                    await success(channel, "Confirmed, this redeemable is for all platforms.")
                    return "All platforms"
                } else {
                    await error(channel, `The platform is not recognised. (${i}/5)`);
                }
            } catch {
                await error(channel, `The platform is not recognised. (${i}/5)`);
            }
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
checkDlc function checks if the user is giving away a DLC or the game key.
@param member, channel, guild
@return number (1 for DLC, 2 for game) otherwise Boolean false
*/
async function checkRedeemableType(member, channel, guild) {
    await getDlcEmbed(channel);
    for (let i = 1; i <= 5; i++) {
        const filter = m => m.author.id === member.id && m.channel.id === channel.id;
        try {
            const collected = await channel.awaitMessages({filter, max: 1, time: 60_000});
            const response = collected.first()
            const content = response.content;
            try {
                const numberContent = Number(content);

                if (numberContent === 1) {
                    // this is a DLC
                    await success(channel, `Confirmed, the key redeems a DLC.`);
                    return 1;
                } else if (numberContent === 2) {
                    // this is a full game
                    await success(channel, `Confirmed, the key redeems a full game.`);
                    return 2;
                } else {
                    await error(channel, `Option given is not 1 or 2. (${i}/5)`)
                }
            } catch {
                await error(channel, `Option given is not 1 or 2. (${i}/5)`)
            }
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
checkDlc function checks if the user is giving away a DLC or the game key.
@param member, channel, guild
@return number (1 for DLC, 2 for game) otherwise Boolean false
*/
async function getDlcName(member, channel, guild) {
    await getDlcNameEmbed(channel);
    const filter = m => m.author.id === member.id && m.channel.id === channel.id;
    try {
        const collected = await channel.awaitMessages({filter, max: 1, time: 60_000});
        const response = collected.first()
        const content = response.content;
        await success(channel, `Confirmed, the DLC name is '${content}'.`);
        return content.toUpperCase();
    } catch {
        // catch timeout error
        await error(channel, "Timed out. Please try again.");
        return false;
    }
}
/*
getImage function optionally get an image link and post it on the embed.
@param member, channel, guild
@return None (if not sending image), string image link (if sending image)
*/
async function getImage(member, channel, guild) {
    await getImageEmbed(channel);
    for (let i = 1; i <= 5; i++) {
        const filter = m => m.author.id === member.id && m.channel.id === channel.id;
        try {
            const collected = await channel.awaitMessages({filter, max: 1, time: 60_000});
            const response = collected.first()
            const content = response.content;
            const filename = [".jpeg", ".png", ".jpg", ".gif"];

            if (content.toLowerCase() === "none") {
                await success(channel, "An image will not be used.")
                return "None";
            }

            if (content.includes("http")) {
                for (name of filename) {
                    if (content.includes(name)) {
                        await success(channel, "Image confirmed.")
                        return content.toString();
                    }
                }
                await error(channel, `Image doesn't include file type e.g ".jpg" (${i}/5)`)
            } else {
                await error(channel, `Image link not detected. Try again. (${i}/5)`)
            }
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
getDate function gets the date of the giveaway draw.
@param member, channel, guild
@return string date
*/
async function getDate(member, channel, guild) {
    await getDateEmbed(channel);
    for (let i = 1; i <= 5; i++) {
        const filter = m => m.author.id === member.id && m.channel.id === channel.id;
        try {
            const collected = await channel.awaitMessages({filter, max: 1, time: 60_000});
            const response = collected.first()
            const content = response.content;
            try {
                const option = Number(content);
                if (option > 0) {
                    await success(channel, `Confirmed, giveaway will begin in ${option} day(s).`)

                    //////////////////////

                    let dateGiveaway = dayjs().add(option, 'minute').format('YYYY/M/D/H/m').toString();
                    let removeDate = dayjs().add(option + 10, 'minute').format('YYYY/M/D/H/m').toString();
                    return [dateGiveaway, removeDate];

                    /// change this back

                    //////////////////////


                } else if (option < 1) {
                    await error(channel, `Cannot have less than 1 day. (${i}/5)`)
                } else {
                    await error(channel, `Day(s) number not recognised. (${i}/5)`)
                }
            } catch {
                await error(channel, `Number of day(s) is not detected. (${i}/5)`)
            }
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
getSerialKey function privately gets the serial key of the redeemable.
@param member, channel, guild, messageId
@return string serial key
*/
async function getSerialKey(member, channel, guild, messageId) {
    await getSerialKeyEmbed(channel);
    await getSerialKeyDMEmbed(member);
    await wait(120000);
    //Time out process if serial key not given.
    database.query("SELECT * FROM redeemable", async function (err, result, fields) {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            if (result[i].messageId === messageId && result[i].ownerId === member.id && result[i].skey === null) {
                await error(member, "Process has timed out.")
                let sql = `DELETE FROM redeemable WHERE messageId = ${messageId}`;
                database.query(sql, function (err, result) {
                    if (err) throw err;
                });
                console.log(`${dayjs()}: 1 redeemable removed.`);
            }
        }
    });
}
// embed to let user that called command know that the steps will be taken via private message
async function startup(interaction) {
    await interaction.deferReply();
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setTitle(`0. Redeemable creation function enabled.`)
        .setFooter(`${function_name} ${version}`);
    const message = await interaction.editReply({embeds: [debug]});
    return message.id;
}

// embed for get game title
async function getGameNameEmbed(channel) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setTitle(`1. What game is this for?`)
        .setDescription(`Provide the official name of the game that this redeemable is dedicated to, for example:\n\n` +
            `**Call of Duty: Warzone, Minecraft Java Edition, New World...**`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}

// embed for get mention intro
async function getMentionEmbed(channel) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setTitle(`2. The role to mention members.`)
        .setDescription(`The mention will be posted with the redeemable post to notify users of the giveaway.` +
        ` For example, if the redeemable is for the game **Call of Duty: Warzone**, use the mention <@&861274219101552650>\n\n` +
        `If a mention is unavailable, use the mention <@&869537874314420264>`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}
// embed for get mention intro
async function getPlatformEmbed(channel) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setTitle(`3. What platform is this for?`)
        .setDescription(`Enter the platform **(by its number)** that this game/DLC is for, the options are listed below:\n` +
        `\n**(1)** PC`+
        `\n**(2)** Playstation / PSN`+
        `\n**(3)** Xbox`+
        `\n**(4)** All platforms`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}

// embed for get mention intro
async function getDlcEmbed(channel) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setTitle(`4. Does the key redeem a DLC or a full game?`)
        .setDescription(`DLCs includes but is not limited to a key for an addon, skin pack, in-game credits etc. A full game is a key for a copy of the full game.`
        + `\n\nEnter the **number** from the options below:\n` + `**(1)** This is for a DLC.\n` + `**(2)** This is for a full game.`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}
// embed for get mention intro
async function getDlcNameEmbed(channel) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setTitle(`4.5. What's the name of the DLC?`)
        .setDescription(`This could help members see if they already have the DLC or to check what it contains.`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}
// embed for get Image
async function getImageEmbed(channel) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setTitle(`5. Optional: Link an image.`)
        .setDescription(`You can link an image to make the redeemable more appealing. \n\nOtherwise enter **none** if you do not wish to add an image. \n\nThe image could be related to the giveaway, such as an image of the DLC/Game.`
        + `\n\nNote that you can't upload an image directly to here, you'll need to link **(the URL address)** of an image from the internet. Using an image uploaded to **Imgur** works best.` +
        `\n\nFor example, the image URL could be something like this:\n` + "```https://website.com/image.jpeg```")
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}
// embed for get date
async function getDateEmbed(channel) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setTitle(`6. How many day(s) until the giveaway ends?`)
        .setDescription(`This is the date when the giveaway will end and a random winner is chosen.` +
        ` The date cannot be less than **1 day (24 hours)** from the creation of this redeemable.\n\n` +
        `A good timeframe would be 7 days, so a week for everyone to sign up. However a date too long could discourage members from signing up.`
        + `\n\n**Enter a number of days: e.g. 5 (for +5 days)**`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}
// embed for get date
async function getSerialKeyEmbed(channel) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setTitle(`7. Enter the serial key (via private message)`)
        .setDescription(`To continue please respond to the private message sent to you. **Please don't enter the serial key here.**`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}
// embed for get date DM
async function getSerialKeyDMEmbed(member) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setTitle(`7. Enter the serial key here.`)
        .setDescription(`Include dashes (-) and slashes (/) if any.` +
        `\n\nNote that the key cannot be validated for its authenticity, therefore it's your responsibility to ensure that the key hasn't been used and is accurate.`)
        .setFooter(`${function_name} ${version}`);
    const channel = await member.send({embeds: [debug]});
    return channel;
}
//embed success
async function success(channel, successMessage) {
    const debug = new MessageEmbed()
        .setColor("#33b020")
        .setTitle(`${successMessage}`)
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

async function hasSymbol(myString) {
    let symbols = /[@#$%^&*()_+\=\[\]{};'"\\,.<>\/?]+/;
    return symbols.test(myString);
}

// remover of event
async function eventRemove(messageId) {
    try{
        database.query("SELECT * FROM redeemable", async function (err, result, fields) {
            if (err) throw err;
            for (let i = 0; i < result.length; i++) {
                if (result[i].messageId === messageId) {
                    let sql = `DELETE FROM redeemable WHERE messageId = ${messageId}`;
                    database.query(sql, function (err, result) {
                        if (err) throw err;
                    });
                    console.log(`${dayjs()}: 1 redeemable removed.`);
                }
            }
        });
    } catch (e) {
        console.error(e);
    }
}
// function for adding user to the redeemable event
async function addParticipant(message, user, channel){
    // check if participant not already in database
    database.query("SELECT * FROM redeemable", async function (err, result, fields) {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            if (result[i].publishedMessageId === message.message.id && result[i].publishedChannelId === `${channel.id}`) {
                const dateArray = result[i].date.split("/");
                const date = dayjs([dateArray[0], dateArray[1]-1, dateArray[2], dateArray[3], dateArray[4]]).format("ddd D MMM HH:mm");
                // if there are no other participants
                if (result[i].participants === null) {
                    let sql = `UPDATE redeemable SET participants = "${user.id}" WHERE publishedMessageId = ${message.message.id}`;
                    database.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log(`${dayjs()}: participants updated.`);
                        }
                    );
                    return await participantEmbed(user, `${user.username}, you're now registered for ${result[i].gameName} giveaway.`, `👉 Find more information about it here:\n <#${result[i].publishedChannelId}>\n\n🍪 Be on the lookout for a winner's message on **${date} CET.**`)
                } else {
                    const participantsArray = result[i].participants.split(",");
                    participantsArray.push(`${user.id}`);
                    let sql = `UPDATE redeemable SET participants = '${participantsArray.toString()}' WHERE publishedMessageId = ${message.message.id}`;
                    database.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log(`${dayjs()}: participants updated.`);
                        }
                    );
                    return await participantEmbed(user, `${user.username}, you're now registered for ${result[i].gameName} giveaway.`, `👉 Find more information about it here:\n <#${result[i].publishedChannelId}>\n\n🍪 Be on the lookout for a winner's message on **${date} CET.**`)
                }
            }
        }
    });
}
// function for adding user to the redeemable event
async function removeParticipant(message, user, channel){
    // check if participant not already in database
    database.query("SELECT * FROM redeemable", async function (err, result, fields) {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            if (result[i].publishedMessageId === message.message.id && result[i].publishedChannelId === `${channel.id}`) {
                // remove participants function
                const gameName = result[i].gameName;
                try {
                    const participants = result[i].participants.split(",");
                    // if this is the only participant
                    if (participants.length <= 1) {
                        let sql = `UPDATE redeemable SET participants = null WHERE publishedMessageId = ${message.message.id}`;
                        database.query(sql, function (err, result) {
                                if (err) throw err;
                                console.log(`${dayjs()}: participants updated.`);
                            }
                        );
                        return await participantEmbed(user, `You're no longer registered for ${gameName} giveaway.`, "😀 Changed your mind? Simply react to the event again.")
                    } else {
                        for (let i = 0; i <= participants.length; i++) {
                            if (participants[i] === `${user.id}`) {
                                participants.splice(i, 1);
                                let sql = `UPDATE redeemable SET participants = "${participants}" WHERE publishedMessageId = ${message.message.id}`;
                                database.query(sql, function (err, result) {
                                        if (err) throw err;
                                        console.log(`${dayjs()}: participants updated.`);
                                    }
                                );
                                return await participantEmbed(user, `You're no longer registered for ${gameName} giveaway.`, "😀 Changed your mind? Simply react to the event again.")
                            }
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }
    });
}
//embed added participant
async function participantEmbed(channel, successHeader, successDescriptor) {
    const debug = new MessageEmbed()
        .setColor("#a73bd7")
        .setTitle(`${successHeader}`)
        .setDescription(`${successDescriptor}`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}
