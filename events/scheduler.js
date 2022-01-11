const dayjs = require("dayjs");
const schedule = require('node-schedule');

const arraySupport = require("dayjs/plugin/arraySupport");
const mysql = require("mysql");
const {database_host, port, database_username, database_password, database_name} = require("../database.json");
const {MessageEmbed} = require("discord.js");
dayjs.extend(arraySupport);
const guildId = "860934544693919744";


const function_name = "RapidShard | Redeemable"
const version = 0.1;

// database connection
let database = mysql.createConnection({
    host: database_host,
    port: port,
    user: database_username,
    password: database_password,
    database: database_name
});



module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${dayjs()}: Scheduler on.`);
        await redeemableSchedule(client);

    }, redeemableSchedule

};

// scheduler
async function redeemableSchedule(client) {
    console.log(`${dayjs()}: RedeemableScheduler is initiated.`)
    database.query("SELECT * FROM redeemable", async function (err, result, fields) {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            const messageId = result[i].messageId;
            let giveawayDate = result[i].date;
            let dateSplit = giveawayDate.split("/")
            const date = new Date(dateSplit[0], dateSplit[1] - 1, dateSplit[2], dateSplit[3], dateSplit[4]);
            try {
                const job = await schedule.scheduleJob(date, async function () {

                    database.query("SELECT * FROM redeemable", async function (err, result, fields) {
                        if (err) throw err;
                        for (let i = 0; i < result.length; i++) {
                            if (messageId === result[i].messageId) {
                                const guild = await client.guilds.cache.get(guildId);
                                const channelId  = result[i].publishedChannelId;
                                const channel = await guild.channels.fetch(channelId);
                                const publishedMessageId = result[i].publishedMessageId;
                                const postedAnnouncementMessage = await channel.messages.fetch(publishedMessageId)
                                    .then(message => {
                                        return message})
                                    .catch(console.error);
                                await postedAnnouncementMessage.reactions.removeAll();

                                // pick a winner
                                const participants = (result[i].participants).split(",");

                                let member = guild.members.cache.get(result[i].ownerId);
                                let gameName = result[i].gameName;
                                let redeemableType = result[i].redeemableType;
                                let DlcName = result[i].DlcName;
                                let ImageLink = result[i].imageLink;
                                let platform = result[i].platform;
                                let key = result[i].skey;
                                let removeDate = result[i].removeDate;
                                // remove reaction
                                try {
                                    const winnerNum = Math.floor(Math.random() * participants.length);
                                    const winner = participants[winnerNum];
                                    const winnerMember = await guild.members.fetch(winner)
                                        .then(member => {return member})
                                        .catch(console.error);

                                    let messageId = result[i].messageId;

                                    // update database
                                    let sql = `UPDATE redeemable SET winner = ${winnerMember.user.id} WHERE messageId = ${messageId}`;
                                    database.query(sql, function (err, result) {
                                            if (err) throw err;
                                            console.log(`${dayjs()}: winner updated.`);
                                        }
                                    );

                                    // update published message embed

                                    await updateEmbedMessage(member, channel, guild, gameName, redeemableType, DlcName, ImageLink, giveawayDate, postedAnnouncementMessage, platform, winnerMember);
                                    // tell winner
                                    await winnerEmbed(member, channel, guild, gameName,redeemableType,DlcName,ImageLink,giveawayDate, postedAnnouncementMessage,platform,winnerMember,key);
                                    // schedule remove date
                                    return await redeemableScheduleRemoval(client, removeDate, channel);
                                } catch (e) {
                                    console.error(e)
                                }
                            }
                        }
                    });
                });
            } catch (e) {console.error(e)}
        }
    });
}

// scheduler to remove redeemable
async function redeemableScheduleRemoval(client, removeDate, channel) {
    console.log(`${dayjs()}: Redeemable removal is initiated.`)
    let dateSplit = removeDate.split("/")
    const date = new Date(dateSplit[0], dateSplit[1] - 1, dateSplit[2], dateSplit[3], dateSplit[4]);
    const job = await schedule.scheduleJob(date, async function () {
        try {
            // schedule remove date
            await channel.delete()
                .then()
                .catch();
        } catch (e) {
            console.error(e)
        }
    });
}

//update embed message
async function updateEmbedMessage(member, textChannel, guild, gameName, redeemableType, DlcName, ImageLink, date, message, platform, winner){

    const giveawayDate = dayjs(date.split("/")).format("ddd D MMM HH:mm");

    // is a DLC
    if (redeemableType === "1") {
        // does have an image
        if (ImageLink !== "None") {
            const debug = new MessageEmbed()
                .setColor("#3288de")
                .setTitle(`${gameName} DLC (${DlcName}) GIVEAWAY @${giveawayDate} GMT`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👏 **${member.user.username}#${member.user.discriminator}** is giving away a DLC/Expansion Pack for **${gameName}.**` +
                    `\n\nℹ️ Supported platform: **${platform}**` +
                    `\n\n👉 The winner will receive a digital key for the **${DlcName}** **DLC** which will be dmed by the Rapidshard bot.\n\n` +
                    `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
                .setFields({name: `_ _`,value: "👑 Winner```js\n"+`${winner.user.username}#${winner.user.discriminator}`+"```", inline: false})
                .setImage(`${ImageLink}`)
                .setFooter(`${function_name} ${version}`);
            await message.edit({embeds: [debug]});
        } else {
            // does not have an image
            const debug = new MessageEmbed()
                .setColor("#3288de")
                .setTitle(`${gameName} DLC (${DlcName}) GIVEAWAY @${giveawayDate} GMT`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👏 **${member.user.username}#${member.user.discriminator}** is giving away a DLC/Expansion Pack for **${gameName}.**\n\n` +
                    `\n\nℹ️ Supported platform: **${platform}**` +
                    `\n\n👉 The winner will receive a digital key for the DLC: **${DlcName}** which will be dmed by the Rapidshard bot.\n\n` +
                    `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
                .setFields({name: `_ _`,value: "👑 Winner```js\n"+`${winner.user.username}#${winner.user.discriminator}`+"```", inline: false})
                .setFooter(`${function_name} ${version}`);
            await message.edit({embeds: [debug]});
        }
    } else if (redeemableType === "2") {
        // full game
        // does have an image
        if (ImageLink !== "None") {
            const debug = new MessageEmbed()
                .setColor("#3288de")
                .setTitle(`${gameName} GIVEAWAY @${giveawayDate} GMT`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👏 **${member.user.username}#${member.user.discriminator}** is giving away a full game copy of **${gameName}.**` +
                    `\n\nℹ️ Supported platform: **${platform}**` +
                    `\n\n👉 The winner will receive a digital key for the game which will be dmed by the Rapidshard bot.\n\n` +
                    `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
                .setFields({name: `_ _`,value: "👑 Winner```js\n"+`${winner.user.username}#${winner.user.discriminator}`+"```", inline: false})
                .setImage(`${ImageLink}`)
                .setFooter(`${function_name} ${version}`);
            await message.edit({embeds: [debug]});
        } else {
            // does not have an image
            const debug = new MessageEmbed()
                .setColor("#3288de")
                .setTitle(`${gameName} GIVEAWAY @${giveawayDate} GMT`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👏 **${member.user.username}#${member.user.discriminator}** is giving away a full game copy of **${gameName}.**` +
                    `\n\nℹ️ Supported platform: **${platform}**\nIf you` +
                    `\n\n👉 The winner will receive a digital key for the game which will be dmed by the Rapidshard bot.\n\n` +
                    `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
                .setFields({name: `_ _`,value: "👑 Winner```js\n"+`${winner.user.username}#${winner.user.discriminator}`+"```", inline: false})
                .setFooter(`${function_name} ${version}`);
            await message.edit({embeds: [debug]});
        }
    } else {
        return console.error("Published redeemable type not 1 or 2.")
    }
}

//winner embed message
async function winnerEmbed(member, textChannel, guild, gameName, redeemableType, DlcName, ImageLink, date, message, platform, winner, key){

    // is a DLC
    if (redeemableType === "1") {
        // does have an image
        if (ImageLink !== "None") {
            const debug = new MessageEmbed()
                .setColor("#3288de")
                .setTitle(`Congratulations **${winner.user.username}#${winner.user.discriminator}**`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👑 You've won ${gameName} DLC (${DlcName}) courtesy of **${member.user.username}#${member.user.discriminator}**.` +
                    `\n\nℹ️ Supported platform: **${platform}**\nIf you feel that you don't want the key anymore before redeeming it, please feel free to give it to someone else or ask a staff to redraw it.\n\n👉 Find out more: <#${textChannel.id}>`)
                .setFields({name: `_ _`,value: "🔑 Your key, enjoy```js\n"+`${key}`+"```", inline: false})
                .setImage(`${ImageLink}`)
                .setFooter(`${function_name} ${version}`);
            await winner.send({embeds: [debug]});
        } else {
            // does not have an image
            const debug = new MessageEmbed()
                .setColor("#3288de")
                .setTitle(`Congratulations **${winner.user.username}#${winner.user.discriminator}**`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👑 You've won **${gameName} DLC (${DlcName})** courtesy of **${member.user.username}#${member.user.discriminator}**.` +
                    `\n\nℹ️ Supported platform: **${platform}**\nIf you feel that you don't want the key anymore before redeeming it, please feel free to give it to someone else or ask a staff to redraw it.\n\n👉 Find out more: <#${textChannel.id}>`)
                .setFields({name: `_ _`,value: "🔑 Your key, enjoy```js\n"+`${key}`+"```", inline: false})
                .setFooter(`${function_name} ${version}`);
            await winner.send({embeds: [debug]});
        }
    } else if (redeemableType === "2") {
        // full game
        // does have an image
        if (ImageLink !== "None") {
            const debug = new MessageEmbed()
                .setColor("#3288de")
                .setTitle(`Congratulations **${winner.user.username}#${winner.user.discriminator}**`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👑 You've won a copy of **${gameName}** courtesy of **${member.user.username}#${member.user.discriminator}**.` +
                    `\n\nℹ️ Supported platform: **${platform}**\nIf you feel that you don't want the key anymore before redeeming it, please feel free to give it to someone else or ask a staff to redraw it.\n\n👉 Find out more: <#${textChannel.id}>`)
                .setFields({name: `_ _`,value: "🔑 Your key, enjoy```js\n"+`${key}`+"```", inline: false})
                .setImage(`${ImageLink}`)
                .setFooter(`${function_name} ${version}`);
            await winner.send({embeds: [debug]});
        } else {
            // does not have an image
            const debug = new MessageEmbed()
                .setColor("#3288de")
                .setTitle(`Congratulations **${winner.user.username}#${winner.user.discriminator}**`)
                .setThumbnail('https://i.imgur.com/BOUt2gY.png')
                .setDescription(`👑 You've won a copy of **${gameName}** courtesy of **${member.user.username}#${member.user.discriminator}**.` +
                    `\n\nℹ️ Supported platform: **${platform}**\nIf you feel that you don't want the key anymore before redeeming it, please feel free to give it to someone else or ask a staff to redraw it.\n\n👉 Find out more: <#${textChannel.id}>`)
                .setFields({name: `_ _`,value: "🔑 Your key, enjoy```js\n"+`${key}`+"```", inline: false})
                .setFooter(`${function_name} ${version}`);
            await winner.send({embeds: [debug]});
        }
    } else {
        return console.error("Published redeemable type not 1 or 2.")
    }
}
