const { MessageEmbed} = require("discord.js");
const wait = require('util').promisify(setTimeout);
const dayjs = require('dayjs');
const { pool } = require("../db");




const {getGameName, getMention, checkRedeemableType, getDlcName, getImage, getDate, getSerialKey, eventRemove, getPlatform} = require("../commands/redeemable");
const {redeemableSchedule} = require("../events/scheduler")
const eventCategoryId = "870350901288788039";
const { pool } = require("../db");
const arraySupport = require("dayjs/plugin/arraySupport");
dayjs.extend(arraySupport);

const function_name = "RapidShard | Redeemable"
const version = 0.1;

const guildId = "860934544693919744";

module.exports = {
    name: 'messageCreate',
    async execute(message) {

        //check if message is a dm for the redeemable Event
        if (message.guildId === null && message.author.bot === false) {
            try {
                pool.query(`SELECT * FROM "redeemable"`, async function (err, result, fields) {
                    if (err) throw err;
                    for (let i = 0; i < result.rows.length; i++) {
                        if (result.rows[i].ownerId === message.author.id && result.rows[i].skey === null) {

                            const member = message.author;

                            async function hasSymbol(myString) {
                                let symbols = /[@#$%^&*()_+\=\[\]{};'"\\,.<>\?]+/;
                                return symbols.test(myString);
                            }

                            if (!await hasSymbol(message.content)) {
                                await pool.query(`UPDATE "redeemable" SET "skey" = $1 WHERE "ownerId" = $2 AND "messageId" = $3`,
                                    [message.content, message.author.id, result.rows[i].messageId,]);
                                await success(member, `Confirmed, ${message.content}`)
                                await backToChannel(member, `Please continue by going back to the Moist Comms channel.`);
                                const client = message.client;
                                const guild = await client.guilds.fetch(guildId);
                                const channel = await guild.channels.cache.get(result.rows[i].channelId);
                                const messageId = result.rows[i].messageId;
                                return redeemableConfirmation(member, channel, guild, messageId, client);
                            } else {
                                return error(member, "This symbol is not detected in a typical serial key.")
                            }
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

    await channel.send(`${member}`);
    pool.query(`SELECT * FROM "redeemable"`, async function (err, result, fields) {
        if (err) throw err;
        for (let i = 0; i < result.rows.length; i++) {
            if (result.rows[i].messageId === messageId) {
                const mentionRole = await guild.roles.fetch(result.rows[i].mention);

                const gameName = result.rows[i].gameName;
                const mention = mentionRole;
                const redeemableType = result.rows[i].redeemableType;
                const DlcName = result.rows[i].DlcName;
                const imageLink = result.rows[i].imageLink;
                const date = result.rows[i].date;
                const platform = result.rows[i].platform;
                await confirmationEmbed(channel, gameName, mentionRole.name, redeemableType, DlcName, imageLink, date, platform);
                const redeemableTypeA = result.rows[i].redeemableType;
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
                                    return redeemableSchedule(client, guild);
                                }
                                const option = Number(content);
                                // game name option 1
                                switch (option) {
                                    case 1:
                                        const gameName = await getGameName(member, channel, guild);
                                        if (gameName) {
                                            await pool.query(`UPDATE "redeemable" SET "gameName" = $1 WHERE "messageId" = $2`, [gameName, messageId,])
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    case 2:
                                        const mention = await getMention(member, channel, guild);
                                        if (mention) {
                                            await pool.query(`UPDATE "redeemable" SET "mention" = $1 WHERE "messageId" = $2`, [mention, messageId,]);
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    case 3:
                                        const platform = await getPlatform(member, channel, guild);
                                        if (platform) {
                                            await pool.query(`UPDATE "redeemable" SET "platform" = $1 WHERE "messageId" = $2`, [platform, messageId,]);
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
                                                await pool.query(`UPDATE "redeemable" SET "redeemableType" = $1, "DlcName" = $2 WHERE "messageId" = $3`,
                                                    [redeemableType, DlcName, messageId,]);
                                            } else {
                                                await eventRemove(messageId);
                                            }
                                            return redeemableConfirmation(member, channel, guild, messageId);
                                        } else if (redeemableType === 2) {
                                            await pool.query(`UPDATE "redeemable" SET "redeemableType" = $1, "DlcName" = $2 WHERE "messageId" = $3`,
                                                [redeemableType, null, messageId,]);
                                            return redeemableConfirmation(member, channel, guild, messageId);
                                        } else {
                                            await eventRemove(messageId);
                                            return console.error("RedeemableType not 1 or 2.")
                                        }
                                    case 5:
                                        const DlcName = await getDlcName(member, channel, guild);
                                        if (DlcName) {
                                            await pool.query(`UPDATE "redeemable" SET "DlcName" = $1 WHERE "messageId" = $2`,
                                                [DlcName, messageId,]);
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    case 6:
                                        const date = await getDate(member, channel, guild)
                                        if (date) {
                                            await pool.query(`UPDATE "redeemable" SET "date" = $1 WHERE "messageId" = $2`,
                                                [date, messageId]);
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    case 7:
                                        await pool.query(`UPDATE "redeemable" SET "skey" = $1 WHERE "messageId" = $2`,
                                            [null, messageId]);
                                        return await getSerialKey(member, channel, guild);
                                    case 8:
                                        const imageLink = await getImage(member, channel, guild);
                                        if (imageLink) {
                                            await pool.query(`UPDATE "redeemable" SET "imageLink" = $1 WHERE messageId = $2`, [imageLink, messageId]);
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
                                    return redeemableSchedule(client, guild);
                                }
                                const option = Number(content);
                                // game name option 1
                                switch (option) {
                                    case 1:
                                        const gameName = await getGameName(member, channel, guild);
                                        if (gameName) {
                                            await pool.query(`UPDATE "redeemable" SET "gameName" = $1 WHERE "messageId" = $2`, [gameName, messageId,])
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    case 2:
                                        const mention = await getMention(member, channel, guild);
                                        if (mention) {
                                            await pool.query(`UPDATE "redeemable" SET "mention" = $1 WHERE "messageId" = $2`, [mention, messageId,]);
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    case 3:
                                        const platform = await getPlatform(member, channel, guild);
                                        if (platform) {
                                            await pool.query(`UPDATE "redeemable" SET "platform" = $1 WHERE "messageId" = $2`, [platform, messageId,]);
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
                                                await pool.query(`UPDATE "redeemable" SET "redeemableType" = $1, "DlcName" = $2 WHERE "messageId" = $3`,
                                                    [redeemableType, DlcName, messageId,]);
                                            } else {
                                                await eventRemove(messageId);
                                            }
                                            return redeemableConfirmation(member, channel, guild, messageId);
                                        } else if (redeemableType === 2) {
                                            await pool.query(`UPDATE "redeemable" SET "redeemableType" = $1, "DlcName" = $2 WHERE "messageId" = $3`,
                                                [redeemableType, null, messageId,]);
                                            return redeemableConfirmation(member, channel, guild, messageId);
                                        } else {
                                            await eventRemove(messageId);
                                            return console.error("RedeemableType not 1 or 2.")
                                        }
                                    case 5:
                                        const date = await getDate(member, channel, guild)
                                        if (date) {
                                            await pool.query(`UPDATE "redeemable" SET "date" = $1 WHERE "messageId" = $2`,
                                                [date, messageId]);
                                        } else {
                                            await eventRemove(messageId);
                                        }
                                        return redeemableConfirmation(member, channel, guild, messageId);
                                    case 6:
                                        await pool.query(`UPDATE "redeemable" SET "skey" = $1 WHERE "messageId" = $2`,
                                            [null, messageId]);
                                        let sql = `UPDATE redeemable SET skey = null WHERE messageId = ${messageId}`;
                                        return await getSerialKey(member, channel, guild);
                                    case 7:
                                        const imageLink = await getImage(member, channel, guild);
                                        if (imageLink) {
                                            await pool.query(`UPDATE "redeemable" SET "imageLink" = $1 WHERE messageId = $2`, [imageLink, messageId]);
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

    await pool.query(`UPDATE "redeemable" SET "publishedChannelId" = $1 WHERE messageId = $2`, [textChannel.id, messageId]);

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
                .setTitle(`${gameName} DLC (${DlcName}) GIVEAWAY @${giveawayDate} CET`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👏 **${member.username}#${member.discriminator}** is giving away a DLC/Expansion Pack for **${gameName}.**` +
                `\n\nℹ️ Supported platform: **${platform}**` +
                `\n\n👉 The winner will receive a digital key for the **${DlcName}** **DLC** which will be dmed by the Rapidshard bot.\n\n` +
                `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
                .setFields({name: `_ _`,value: "```js\n"+`### AWAITING DRAW ###`+"```", inline: false})
                .setImage(`${ImageLink}`)
                .setFooter(`${function_name} ${version}`);
            const publishedMessage = await textChannel.send({embeds: [debug]});
            await pool.query(`UPDATE "redeemable" SET "publishedMessageId" = $1 WHERE "messageId" = $2`, [publishedMessage.id, messageId]);
            return publishedMessage;
        } else {
            // does not have an image
            const debug = new MessageEmbed()
                .setColor("#a73bd7")
                .setTitle(`${gameName} DLC (${DlcName}) GIVEAWAY @${giveawayDate} CET`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👏 **${member.username}#${member.discriminator}** is giving away a DLC/Expansion Pack for **${gameName}.**` +
                    `\n\nℹ️ Supported platform: **${platform}**` +
                    `\n\n👉 The winner will receive a digital key for the DLC: **${DlcName}** which will be dmed by the Rapidshard bot.\n\n` +
                    `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
                .setFields({name: `_ _`,value: "```js\n"+`### AWAITING DRAW ###`+"```", inline: false})
                .setFooter(`${function_name} ${version}`);
            const publishedMessage = await textChannel.send({embeds: [debug]});
            await pool.query(`UPDATE "redeemable" SET "publishedMessageId" = $1 WHERE "messageId" = $2`, [publishedMessage.id, messageId]);
            return publishedMessage;
        }
    } else if (redeemableType === "2") {
        // full game
        // does have an image
        if (ImageLink !== "None") {
            const debug = new MessageEmbed()
                .setColor("#a73bd7")
                .setTitle(`${gameName} GIVEAWAY @${giveawayDate} CET`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👏 **${member.username}#${member.discriminator}** is giving away a full game copy of **${gameName}.**` +
                    `\n\nℹ️ Supported platform: **${platform}**` +
                    `\n\n👉 The winner will receive a digital key for the game which will be dmed by the Rapidshard bot.\n\n` +
                    `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
                .setFields({name: `_ _`,value: "```js\n"+`### AWAITING DRAW ###`+"```", inline: false})
                .setImage(`${ImageLink}`)
                .setFooter(`${function_name} ${version}`);
            const publishedMessage = await textChannel.send({embeds: [debug]});
            await pool.query(`UPDATE "redeemable" SET "publishedMessageId" = $1 WHERE "messageId" = $2`, [publishedMessage.id, messageId]);
            return publishedMessage;
        } else {
            // does not have an image
            const debug = new MessageEmbed()
                .setColor("#a73bd7")
                .setTitle(`${gameName} GIVEAWAY @${giveawayDate} CET`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👏 **${member.username}#${member.discriminator}** is giving away a full game copy of **${gameName}.**` +
                    `\n\nℹ️ Supported platform: **${platform}**` +
                    `\n\n👉 The winner will receive a digital key for the game which will be dmed by the Rapidshard bot.\n\n` +
                    `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
                .setFields({name: `_ _`,value: "```js\n"+`### AWAITING DRAW ###`+"```", inline: false})
                .setFooter(`${function_name} ${version}`);
            const publishedMessage = await textChannel.send({embeds: [debug]});
            await pool.query(`UPDATE "redeemable" SET "publishedMessageId" = $1 WHERE "messageId" = $2`, [publishedMessage.id, messageId]);
            return publishedMessage;
        }
    } else {
        return console.error("Published redeemable type not 1 or 2.")
    }
}