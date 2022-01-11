const { MessageEmbed} = require("discord.js");
const wait = require('util').promisify(setTimeout);
const dayjs = require('dayjs');
const mysql = require('mysql');
const {database_host, port, database_username, database_password, database_name} = require("../database.json");
const {getGameName, getMention, checkRedeemableType, getDlcName, getImage, getDate, getSerialKey, eventRemove, getPlatform} = require("../commands/redeemable");
const {redeemableSchedule} = require("../events/scheduler")

const schedule = require('node-schedule');
const eventCategoryId = "870350901288788039";


const arraySupport = require("dayjs/plugin/arraySupport");
dayjs.extend(arraySupport);

const function_name = "RapidShard | Redeemable"
const version = 0.1;

const rapidShardChannelId = "908386507633610792";
const guildId = "860934544693919744";

// database connection
let database = mysql.createConnection({
    host: database_host,
    port: port,
    user: database_username,
    password: database_password,
    database: database_name
});

module.exports = {
    name: 'messageCreate',
    async execute(message) {

        //check if message is a dm for the redeemable Event
        if (message.channelId === rapidShardChannelId) {
            try {
                database.query("SELECT * FROM redeemable", async function (err, result, fields) {
                    if (err) throw err;
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].ownerId === message.author.id && result[i].skey === null) {
                            let sql = `UPDATE redeemable SET skey = '${message.content}' 
                                        WHERE ownerId = ${message.author.id} AND messageId = ${result[i].messageId}`;
                            database.query(sql, function (err, result) {
                                    if (err) throw err;
                                    console.log(`${dayjs()}: skey inserted.`);
                                }
                            );
                            const member = message.author;
                            await success(member, `Confirmed, ${message.content}`)
                            await backToChannel(member, `Please continue by going back to the Moist Comms channel.`);
                            const client = message.client;
                            const guild = await client.guilds.fetch(guildId);
                            const channel = await guild.channels.fetch(result[i].channelId);
                            const messageId = result[i].messageId;
                            await channel.send(`${member}`);
                            return redeemableConfirmation(member, channel, guild, messageId, client);
                        }
                    }
                });
            }catch (e) {
                console.error(e);
            }
        }
    }
};
//embed success
async function success(channel, successMessage) {
    const debug = new MessageEmbed()
        .setColor("#33b020")
        .setTitle(`${successMessage}`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}

// function to carry on
async function backToChannel(channel, message) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setTitle(`${message}`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}
// function to confirm the giveaway
async function redeemableConfirmation(member, channel, guild, messageId, client) {

    database.query("SELECT * FROM redeemable", async function (err, result, fields) {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            if (result[i].messageId === messageId) {
                const mentionRole = await guild.roles.fetch(result[i].mention);

                const gameName = result[i].gameName;
                const mention = mentionRole;
                const redeemableType = result[i].redeemableType;
                const DlcName = result[i].DlcName;
                const imageLink = result[i].imageLink;
                const date = result[i].date;
                const platform = result[i].platform;
                await confirmationEmbed(channel, gameName, mentionRole.name, redeemableType, DlcName, imageLink, date, platform);
                const redeemableTypeA = result[i].redeemableType;
                // check if DLC or not DLC
                // it's a DLC
                if (redeemableTypeA === "1") {
                    // loop
                    for (let i = 1; i <= 5; i++) {
                        const filter = m => m.author.id === member.id && m.channel.id === channel.id;
                        try {
                            const collected = await channel.awaitMessages({filter, max: 1, time: 120_000});
                            const response = collected.first()
                            const content = response.content;
                            try {
                                if (content.toLowerCase() === "confirm") {
                                    const textChannel = await publishRedeemable(member,channel, guild, gameName, mention, redeemableType, DlcName, imageLink, date, messageId, platform);
                                    await confirmPublish(textChannel, member, channel);
                                    return redeemableSchedule(client);
                                }
                                const option = Number(content);
                                // game name option 1
                                switch (option) {
                                    case 1:
                                        const gameName = await getGameName(member, channel, guild);
                                        if (gameName) {
                                            let sql = `UPDATE redeemable SET gameName = '${gameName}' WHERE messageId = ${messageId}`;
                                            database.query(sql, function (err, result) {
                                                    if (err) throw err;
                                                    console.log(`${dayjs()}: gameName updated.`);
                                                }
                                            );
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    case 2:
                                        const mention = await getMention(member, channel, guild);
                                        if (mention) {
                                            let sql = `UPDATE redeemable SET mention = ${mention} WHERE messageId = ${messageId}`;
                                            database.query(sql, function (err, result) {
                                                    if (err) throw err;
                                                    console.log(`${dayjs()}: mention updated.`);
                                                }
                                            );
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    case 3:
                                        const platform = await getPlatform(member, channel, guild);
                                        if (platform) {
                                            let sql = `UPDATE redeemable SET platform = '${platform}' WHERE messageId = ${messageId}`;
                                            database.query(sql, function (err, result) {
                                                    if (err) throw err;
                                                    console.log(`${dayjs()}: platform updated.`);
                                                }
                                            );
                                            return redeemableConfirmation(member, channel, guild, messageId);
                                        } else {
                                            await eventRemove(messageId);
                                            return console.error("Platform not detected.")
                                        }
                                    case 4:
                                        const redeemableType = await checkRedeemableType(member, channel, guild);
                                        if (redeemableType === 1) {
                                            const DlcName = await getDlcName(member, channel, guild);
                                            if (DlcName) {
                                                let sql = `UPDATE redeemable SET redeemableType = ${redeemableType}, DlcName = '${DlcName}' WHERE messageId = ${messageId}`;
                                                database.query(sql, function (err, result) {
                                                        if (err) throw err;
                                                        console.log(`${dayjs()}: redeemableType updated.`);
                                                    }
                                                );
                                            } else {
                                                await eventRemove(messageId);
                                            }
                                            return redeemableConfirmation(member, channel, guild, messageId);
                                        } else if (redeemableType === 2) {
                                            let sql = `UPDATE redeemable SET redeemableType = ${redeemableType},  DlcName = null WHERE messageId = ${messageId}`;
                                            database.query(sql, function (err, result) {
                                                    if (err) throw err;
                                                    console.log(`${dayjs()}: redeemableType updated.`);
                                                }
                                            );
                                            return redeemableConfirmation(member, channel, guild, messageId);
                                        } else {
                                            await eventRemove(messageId);
                                            return console.error("RedeemableType not 1 or 2.")
                                        }
                                    case 5:
                                        const DlcName = await getDlcName(member, channel, guild);
                                        if (DlcName) {
                                            let sql = `UPDATE redeemable SET DlcName = '${DlcName}' WHERE messageId = ${messageId}`;
                                            database.query(sql, function (err, result) {
                                                    if (err) throw err;
                                                    console.log(`${dayjs()}: redeemableType updated.`);
                                                }
                                            );
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    case 6:
                                        const date = await getDate(member, channel, guild)
                                        if (date) {
                                            let sql = `UPDATE redeemable SET date = '${date}' WHERE messageId = ${messageId}`;
                                            database.query(sql, function (err, result) {
                                                    if (err) throw err;
                                                    console.log(`${dayjs()}: date updated.`);
                                                }
                                            );
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    case 7:
                                        let sql = `UPDATE redeemable SET skey = null WHERE messageId = ${messageId}`;
                                        database.query(sql, function (err, result) {
                                                if (err) throw err;
                                                console.log(`${dayjs()}: date updated.`);
                                            }
                                        );
                                        return await getSerialKey(member, channel, guild);
                                    case 8:
                                        const imageLink = await getImage(member, channel, guild);
                                        if (imageLink) {
                                            let sql = `UPDATE redeemable SET imageLink = '${imageLink}' WHERE messageId = ${messageId}`;
                                            database.query(sql, function (err, result) {
                                                    if (err) throw err;
                                                    console.log(`${dayjs()}: date updated.`);
                                                }
                                            );
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    default:
                                        await error(channel, `Option not detected. (${i}/5)`)
                                }
                            } catch {
                                await error(channel, `Option not detected. (${i}/5)`)
                            }
                        } catch {
                            // catch timeout error
                            await error(channel, "Timed out. Please try again.");
                            await eventRemove(messageId);
                            return false;
                        }
                    }
                    // catch ran out of tries
                    await error(channel, "You ran out of tries.");
                    await eventRemove(messageId);
                    return false;
                }
                // it's a full game
                else if (redeemableTypeA === "2") {
                    // loop
                    for (let i = 1; i <= 5; i++) {
                        const filter = m => m.author.id === member.id && m.channel.id === channel.id;
                        try {
                            const collected = await channel.awaitMessages({filter, max: 1, time: 120_000});
                            const response = collected.first()
                            const content = response.content;
                            try {
                                if (content.toLowerCase() === "confirm") {
                                    const textChannel = await publishRedeemable(member,channel, guild, gameName, mention, redeemableType, DlcName, imageLink, date, messageId, platform);
                                    await confirmPublish(textChannel, member, channel);
                                    return redeemableSchedule(client);
                                }
                                const option = Number(content);
                                // game name option 1
                                switch (option) {
                                    case 1:
                                        const gameName = await getGameName(member, channel, guild);
                                        if (gameName) {
                                            let sql = `UPDATE redeemable SET gameName = '${gameName}' WHERE messageId = ${messageId}`;
                                            database.query(sql, function (err, result) {
                                                    if (err) throw err;
                                                    console.log(`${dayjs()}: gameName updated.`);
                                                }
                                            );
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    case 2:
                                        const mention = await getMention(member, channel, guild);
                                        if (mention) {
                                            let sql = `UPDATE redeemable SET mention = ${mention} WHERE messageId = ${messageId}`;
                                            database.query(sql, function (err, result) {
                                                    if (err) throw err;
                                                    console.log(`${dayjs()}: mention updated.`);
                                                }
                                            );
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    case 3:
                                        const platform = await getPlatform(member, channel, guild);
                                        if (platform) {
                                            let sql = `UPDATE redeemable SET platform = '${platform}' WHERE messageId = ${messageId}`;
                                            database.query(sql, function (err, result) {
                                                    if (err) throw err;
                                                    console.log(`${dayjs()}: platform updated.`);
                                                }
                                            );
                                            return redeemableConfirmation(member, channel, guild, messageId);
                                        } else {
                                            await eventRemove(messageId);
                                            return console.error("Platform not detected.")
                                        }
                                    case 4:
                                        const redeemableType = await checkRedeemableType(member, channel, guild);
                                        if (redeemableType === 1) {
                                            const DlcName = await getDlcName(member, channel, guild);
                                            if (DlcName) {
                                                let sql = `UPDATE redeemable SET redeemableType = ${redeemableType}, DlcName = '${DlcName}' WHERE messageId = ${messageId}`;
                                                database.query(sql, function (err, result) {
                                                        if (err) throw err;
                                                        console.log(`${dayjs()}: redeemableType updated.`);
                                                    }
                                                );
                                            } else {
                                                await eventRemove(messageId);
                                            }
                                            return redeemableConfirmation(member, channel, guild, messageId);
                                        } else if (redeemableType === 2) {
                                            let sql = `UPDATE redeemable SET redeemableType = ${redeemableType},  DlcName = null WHERE messageId = ${messageId}`;
                                            database.query(sql, function (err, result) {
                                                    if (err) throw err;
                                                    console.log(`${dayjs()}: redeemableType updated.`);
                                                }
                                            );
                                            return redeemableConfirmation(member, channel, guild, messageId);
                                        } else {
                                            await eventRemove(messageId);
                                            return console.error("RedeemableType not 1 or 2.")
                                        }
                                    case 5:
                                        const date = await getDate(member, channel, guild)
                                        if (date) {
                                            let sql = `UPDATE redeemable SET date = '${date}' WHERE messageId = ${messageId}`;
                                            database.query(sql, function (err, result) {
                                                    if (err) throw err;
                                                    console.log(`${dayjs()}: date updated.`);
                                                }
                                            );
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    case 6:
                                        let sql = `UPDATE redeemable SET skey = null WHERE messageId = ${messageId}`;
                                        database.query(sql, function (err, result) {
                                                if (err) throw err;
                                                console.log(`${dayjs()}: date updated.`);
                                            }
                                        );
                                        return await getSerialKey(member, channel, guild);
                                    case 7:
                                        const imageLink = await getImage(member, channel, guild);
                                        if (imageLink) {
                                            let sql = `UPDATE redeemable SET imageLink = '${imageLink}' WHERE messageId = ${messageId}`;
                                            database.query(sql, function (err, result) {
                                                    if (err) throw err;
                                                    console.log(`${dayjs()}: date updated.`);
                                                }
                                            );
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    default:
                                        await error(channel, `Option not detected. (${i}/5)`)
                                }
                            } catch {
                                await error(channel, `Option not detected. (${i}/5)`)
                            }
                        } catch {
                            // catch timeout error
                            await error(channel, "Timed out. Please try again.");
                            await eventRemove(messageId);
                            return false;
                        }
                    }
                    // catch ran out of tries
                    await error(channel, "You ran out of tries.");
                    await eventRemove(messageId);
                    return false;
                } else {
                    console.error("Dlc Name is not 1 or 2.")
                }
            }
        }
    });
}
// embed for confirmation of message
async function confirmationEmbed(channel, gameName, mention, redeemableType, DlcName, imageLink, dayjsDate, platform) {

    const dateSplit = dayjsDate.split("/");
    const date = new Date(dateSplit[0], dateSplit[1] - 1, dateSplit[2], dateSplit[3], dateSplit[4]);

    if (redeemableType === "1") {
        if (imageLink === "None") {
            const debug = new MessageEmbed()
                .setColor("#3288de")
                .setTitle(`7. Please confirm the details.`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`Below are information you added for the creation of the redeemable. \n\nPlease check to see that everything is correct. \n\nIf you'd like to change anything enter the **number** that's next to the header to customise it. \n\nIf everything is ready to be published enter: **confirm**`)
                .setFields({name: `(1) Game Name`,value: "```"+`${gameName}`+"```", inline: false},
                    {name: `(2) Mention`,value: "```"+`@${mention}`+"```",inline: false},
                    {name: `(3) Platform`,value: "```"+`${platform}`+"```",inline: false},
                    {name: `(4) Type`,value: "```"+`DLC`+"```",inline: false},
                    {name: `(5) DLC Name`, value: "```"+`${DlcName}`+"```",inline: false},
                    {name: `(6) Giveaway Date`, value: "```"+`${date}`+"```",inline: false},
                    {name: `(7) Key`, value: "```"+`####REDACTED####`+"```"},
                    {name: `(8) Image Link`,value: "```"+`None`+"```",inline: false})
                .setFooter(`${function_name} ${version}`);
            await channel.send({embeds: [debug]});
        } else {
            const debug = new MessageEmbed()
                .setColor("#3288de")
                .setTitle(`7. Please confirm the details.`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`Below are information you added for the creation of the redeemable. \n\nPlease check to see that everything is correct. \n\nIf you'd like to change anything enter the **number** that's next to the header to customise it. \n\nIf everything is ready to be published enter: **confirm**`)
                .setFields({name: `(1) Game Name`,value: "```"+`${gameName}`+"```", inline: false},
                    {name: `(2) Mention`,value: "```"+`@${mention}`+"```",inline: false},
                    {name: `(3) Platform`,value: "```"+`${platform}`+"```",inline: false},
                    {name: `(4) Type`,value: "```"+`DLC`+"```",inline: false},
                    {name: `(5) DLC Name`, value: "```"+`${DlcName}`+"```",inline: false},
                    {name: `(6) Giveaway Date`, value: "```"+`${date}`+"```",inline: false},
                    {name: `(7) Key`, value: "```"+`####REDACTED####`+"```"},
                    {name: `(8) Image Link`,value: "```"+`${imageLink}`+"```",inline: false},
                    {name: `As an Image`, value: "*If the image doesn't display below and you wish to add an image. Please customise the Image Link field."})
                .setImage(imageLink)

                // .setImage(`${imageLink}`)
                // .setFields({name: `(5) Date`,value: `${date}`})
                .setFooter(`${function_name} ${version}`);
            await channel.send({embeds: [debug]});
        }
    } else if (redeemableType === "2") {
        if (imageLink === "None") {
            const debug = new MessageEmbed()
                .setColor("#3288de")
                .setTitle(`7. Please confirm the details.`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`Below are information you added for the creation of the redeemable. \n\nPlease check to see that everything is correct. \n\nIf you'd like to change anything enter the **number** that's next to the header to customise it. \n\nIf everything is ready to be published enter: **confirm**`)
                .setFields({name: `(1) Game Name`,value: "```"+`${gameName}`+"```",inline: false},
                    {name: `(2) Mention`,value: "```"+`@${mention}`+"```",inline: false},
                    {name: `(3) Platform`,value: "```"+`${platform}`+"```",inline: false},
                    {name: `(4) Type`,value: "```"+`Full Game`+"```",inline: false},
                    {name: `(5) Giveaway Date`,value: "```"+`${date}`+"```",inline: false},
                    {name: `(6) Key`, value: "```"+`####REDACTED####`+"```"},
                    {name: `(7) Image Link`,value: "```"+`None`+"```",inline: false})
                .setFooter(`${function_name} ${version}`);
            await channel.send({embeds: [debug]});
        } else {
            const debug = new MessageEmbed()
                .setColor("#3288de")
                .setTitle(`7. Please confirm the details.`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`Below are information you added for the creation of the redeemable. \n\nPlease check to see that everything is correct. \n\nIf you'd like to change anything enter the **number** that's next to the header to customise it. \n\nIf everything is ready to be published enter: **confirm**`)
                .setFields({name: `(1) Game Name`,value: "```"+`${gameName}`+"```",inline: false},
                    {name: `(2) Mention`,value: "```"+`@${mention}`+"```",inline: false},
                    {name: `(3) Platform`,value: "```"+`${platform}`+"```",inline: false},
                    {name: `(4) Type`,value: "```"+`Full Game`+"```",inline: false},
                    {name: `(5) Giveaway Date`,value: "```"+`${date}`+"```",inline: false},
                    {name: `(6) Key`, value: "```"+`####REDACTED####`+"```"},
                    {name: `(7) Image Link`,value: "```"+`${imageLink}`+"```",inline: false},
                    {name: `As an Image`, value: "*If the image doesn't display below and you wish to add an image. Please customise the Image Link field."})
                .setImage(imageLink)
                .setFooter(`${function_name} ${version}`);
            await channel.send({embeds: [debug]});
        }
    }
}
//embed error
async function error(channel, problem) {
    const debug = new MessageEmbed()
        .setColor("#de3246")
        .setTitle(`Error: ${problem}`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [debug]});
}

/// publish event
async function publishRedeemable(member, channel, guild, gameName, mention, redeemableType, DlcName, ImageLink, date, messageId, platform) {
    let eventCategory = await guild.channels.fetch(eventCategoryId);

    const title = `🎁 GIVEAWAY ${gameName}`
    let textChannel = await eventCategory.createChannel(`${title}`, {type: "GUILD_TEXT", position: 3});


    let sql = `UPDATE redeemable SET publishedChannelId = ${textChannel.id} WHERE messageId = ${messageId}`;
    database.query(sql, function (err, result) {
            if (err) throw err;
            console.log(`${dayjs()}: published channel Id updated.`);
        }
    );

    /// embed message here
    const publishedMessage = await publishedEmbed(member, textChannel, guild, gameName, mention, redeemableType, DlcName, ImageLink, date, messageId, platform);
    // add reactions for the embed message
    await publishedMessage.react(publishedMessage.guild.emojis.cache.get('868172184152064070'));
    return textChannel;
}


// confirmation it has been published
async function confirmPublish(textChannel, member, channel) {
    const debug = new MessageEmbed()
        .setColor("#33b020")
        .setTitle(`${member.username}#${member.discriminator} your redeemable has now been published.`)
        .setDescription(`Thank you for the contribution, find your redeemable here:\n${textChannel}`)
        .setFooter(`${function_name} ${version}`);
    return await channel.send({embeds: [debug]});
}

// main published message Embed
async function publishedEmbed(member, textChannel, guild, gameName, mention, redeemableType, DlcName, ImageLink, date, messageId, platform) {

    await textChannel.send(`${mention}`);

    const dateArray = date.split("/");
    const giveawayDate = dayjs([dateArray[0], dateArray[1]-1, dateArray[2], dateArray[3], dateArray[4]]).format("ddd D MMM HH:mm");

    // is a DLC
    if (redeemableType === "1") {
        // does have an image
        if (ImageLink !== "None") {
            const debug = new MessageEmbed()
                .setColor("#a73bd7")
                .setTitle(`${gameName} DLC (${DlcName}) GIVEAWAY @${giveawayDate} GMT`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👏 **${member.username}#${member.discriminator}** is giving away a DLC/Expansion Pack for **${gameName}.**` +
                `\n\nℹ️ Supported platform: **${platform}**` +
                `\n\n👉 The winner will receive a digital key for the **${DlcName}** **DLC** which will be dmed by the Rapidshard bot.\n\n` +
                `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
                .setFields({name: `_ _`,value: "```js\n"+`### AWAITING DRAW ###`+"```", inline: false})
                .setImage(`${ImageLink}`)
                .setFooter(`${function_name} ${version}`);
            const publishedMessage = await textChannel.send({embeds: [debug]});
            let sql = `UPDATE redeemable SET publishedMessageId = ${publishedMessage.id} WHERE messageId = ${messageId}`;
            database.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(`${dayjs()}: published message inserted.`);
                }
            );
            return publishedMessage;
        } else {
            // does not have an image
            const debug = new MessageEmbed()
                .setColor("#a73bd7")
                .setTitle(`${gameName} DLC (${DlcName}) GIVEAWAY @${giveawayDate} GMT`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👏 **${member.username}#${member.discriminator}** is giving away a DLC/Expansion Pack for **${gameName}.**\n\n` +
                    `\n\nℹ️ Supported platform: **${platform}**` +
                    `\n\n👉 The winner will receive a digital key for the DLC: **${DlcName}** which will be dmed by the Rapidshard bot.\n\n` +
                    `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
                .setFields({name: `_ _`,value: "```js\n"+`### AWAITING DRAW ###`+"```", inline: false})
                .setFooter(`${function_name} ${version}`);
            const publishedMessage = await textChannel.send({embeds: [debug]});
            let sql = `UPDATE redeemable SET publishedMessageId = ${publishedMessage.id} WHERE messageId = ${messageId}`;
            database.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(`${dayjs()}: published message inserted.`);
                }
            );
            return publishedMessage;
        }
    } else if (redeemableType === "2") {
        // full game
        // does have an image
        if (ImageLink !== "None") {
            const debug = new MessageEmbed()
                .setColor("#a73bd7")
                .setTitle(`${gameName} GIVEAWAY @${giveawayDate} GMT`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👏 **${member.username}#${member.discriminator}** is giving away a full game copy of **${gameName}.**` +
                    `\n\nℹ️ Supported platform: **${platform}**` +
                    `\n\n👉 The winner will receive a digital key for the game which will be dmed by the Rapidshard bot.\n\n` +
                    `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
                .setFields({name: `_ _`,value: "```js\n"+`### AWAITING DRAW ###`+"```", inline: false})
                .setImage(`${ImageLink}`)
                .setFooter(`${function_name} ${version}`);
            const publishedMessage = await textChannel.send({embeds: [debug]});
            let sql = `UPDATE redeemable SET publishedMessageId = ${publishedMessage.id} WHERE messageId = ${messageId}`;
            database.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(`${dayjs()}: published message inserted.`);
                }
            );
            return publishedMessage;
        } else {
            // does not have an image
            const debug = new MessageEmbed()
                .setColor("#a73bd7")
                .setTitle(`${gameName} GIVEAWAY @${giveawayDate} GMT`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👏 **${member.username}#${member.discriminator}** is giving away a full game copy of **${gameName}.**` +
                    `\n\nℹ️ Supported platform: **${platform}**` +
                    `\n\n👉 The winner will receive a digital key for the game which will be dmed by the Rapidshard bot.\n\n` +
                    `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
                .setFields({name: `_ _`,value: "```js\n"+`### AWAITING DRAW ###`+"```", inline: false})
                .setFooter(`${function_name} ${version}`);
            const publishedMessage = await textChannel.send({embeds: [debug]});
            let sql = `UPDATE redeemable SET publishedMessageId = ${publishedMessage.id} WHERE messageId = ${messageId}`;
            database.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(`${dayjs()}: published message inserted.`);
                }
            );
            return publishedMessage;
        }
    } else {
        return console.error("Published redeemable type not 1 or 2.")
    }
}