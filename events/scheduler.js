const dayjs = require("dayjs");
const schedule = require('node-schedule');
const arraySupport = require("dayjs/plugin/arraySupport");
const { pool } = require("../db");
const {MessageEmbed} = require("discord.js");
dayjs.extend(arraySupport);
const guildId = "860934544693919744";
const function_name = "RapidShard | Redeemable"
const version = 0.1;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        const guild = client.guilds.cache.get(guildId);
        // await redeemableSchedule(client, guild);
        // await redeemableScheduleRemoval(client, guild);

    }, //redeemableSchedule

};

// scheduler
// async function redeemableSchedule(client, guild) {
//     pool.query(`SELECT * FROM "redeemable"`, async function (err, result, fields) {
//         if (err) throw err;
//         for (let i = 0; i < result.rows.length; i++) {
//             const messageId = result.rows[i].messageId;
//             let giveawayDate = result.rows[i].date;
//             let dateSplit = giveawayDate.split("/")
//             let alreadyWinner = result.rows[i].winner;
//             if (alreadyWinner == null) {
//                 const date = new Date(dateSplit[0], dateSplit[1] - 1, dateSplit[2], dateSplit[3], dateSplit[4]);
//                 const job = await schedule.scheduleJob(date, async function () {
//                     pool.query(`SELECT * FROM "redeemable"`, async function (err, result, fields) {
//                         if (err) throw err;
//                         for (let i = 0; i < result.rows.length; i++) {
//                             if (messageId === result.rows[i].messageId) {
//                                 const channelId = result.rows[i].publishedChannelId;
//                                 const channel = await guild.channels.fetch(channelId);
//                                 const publishedMessageId = result.rows[i].publishedMessageId;
//                                 const postedAnnouncementMessage = await channel.messages.fetch(publishedMessageId)
//                                     .then(message => {
//                                         return message
//                                     })
//                                     .catch(console.error);
//                                 await postedAnnouncementMessage.reactions.removeAll();
//
//                                 // pick a winner
//                                 const participants = (result.rows[i].participants).split(",");
//                                 let member = guild.members.cache.get(result.rows[i].ownerId);
//                                 let gameName = result.rows[i].gameName;
//                                 let redeemableType = result.rows[i].redeemableType;
//                                 let DlcName = result.rows[i].DlcName;
//                                 let ImageLink = result.rows[i].imageLink;
//                                 let platform = result.rows[i].platform;
//                                 let key = result.rows[i].skey;
//                                 let removeDate = result.rows[i].removeDate;
//                                 // remove reaction
//                                 try {
//                                     const winnerNum = Math.floor(Math.random() * participants.length);
//                                     const winner = participants[winnerNum];
//                                     const winnerMember = await guild.members.fetch(winner)
//                                         .then(member => {
//                                             return member
//                                         })
//                                         .catch(console.error);
//
//                                     let messageId = result.rows[i].messageId;
//                                     console.log(winnerMember.user.id, messageId)
//
//                                     // update pool
//                                     // update published message embed
//                                     await pool.query(`UPDATE "redeemable" SET "winner" = $1 WHERE "messageId" = $2`, [winnerMember.user.id, messageId,]);
//
//                                     await updateEmbedMessage(member, channel, guild, gameName, redeemableType, DlcName, ImageLink, giveawayDate, postedAnnouncementMessage, platform, winnerMember);
//                                     // tell winner
//                                     await winnerEmbed(member, channel, guild, gameName, redeemableType, DlcName, ImageLink, giveawayDate, postedAnnouncementMessage, platform, winnerMember, key);
//                                     // schedule remove date
//                                     return await redeemableScheduleRemoval(client, guild);
//                                 } catch (e) {
//                                     console.error(e)
//                                 }
//                             }
//                         }
//                     });
//                 });
//             }
//         }
//     });
//
// }
//
// // scheduler to remove redeemable
// async function redeemableScheduleRemoval(client, guild) {
//     pool.query(`SELECT * FROM "redeemable"`, async function (err, result, fields) {
//         if (err) throw err;
//         for (let i = 0; i < result.rows.length; i++) {
//             let endDate = result.rows[i].removeDate;
//             let channelId = result.rows[i].publishedChannelId;
//             const channel = guild.channels.fetch(channelId)
//                 .then(async channel => {
//                     let dateSplit = endDate.split("/")
//                     const date = new Date(dateSplit[0], dateSplit[1] - 1, dateSplit[2], dateSplit[3], dateSplit[4]);
//                     const job = await schedule.scheduleJob(date, async function () {
//                         try {
//                             // schedule remove date
//                             await channel.delete()
//                                 .then(console.log)
//                                 .catch(console.error);
//                         } catch (e) {
//                             console.error(e)
//                         }
//                     });
//                 })
//                 .catch(console.error);
//         }
//     });
// }
//
// //update embed message
// async function updateEmbedMessage(member, textChannel, guild, gameName, redeemableType, DlcName, ImageLink, date, message, platform, winner){
//
//     const giveawayDate = dayjs(date.split("/")).format("ddd D MMM HH:mm");
//
//     // is a DLC
//     if (redeemableType === 1) {
//         // does have an image
//         if (ImageLink !== "None") {
//             const debug = new MessageEmbed()
//                 .setColor("#3288de")
//                 .setTitle(`${gameName} DLC (${DlcName}) GIVEAWAY @${giveawayDate} CET`)
//                 .setThumbnail('https://i.imgur.com/BOUt2gY.png')
//                 .setDescription(`👏 **${member.user.username}#${member.user.discriminator}** is giving away a DLC/Expansion Pack for **${gameName}.**` +
//                     `\n\nℹ️ Supported platform: **${platform}**` +
//                     `\n\n👉 The winner will receive a digital key for the **${DlcName}** **DLC** which will be dmed by the Rapidshard bot.\n\n` +
//                     `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
//                 .setFields({name: `_ _`,value: "👑 Winner```js\n"+`${winner.user.username}#${winner.user.discriminator}`+"```", inline: false})
//                 .setImage(`${ImageLink}`)
//                 .setFooter(`${function_name} ${version}`);
//             await message.edit({embeds: [debug]});
//         } else {
//             // does not have an image
//             const debug = new MessageEmbed()
//                 .setColor("#3288de")
//                 .setTitle(`${gameName} DLC (${DlcName}) GIVEAWAY @${giveawayDate} CET`)
//                 .setThumbnail('https://i.imgur.com/BOUt2gY.png')
//                 .setDescription(`👏 **${member.user.username}#${member.user.discriminator}** is giving away a DLC/Expansion Pack for **${gameName}.**` +
//                     `\n\nℹ️ Supported platform: **${platform}**` +
//                     `\n\n👉 The winner will receive a digital key for the DLC: **${DlcName}** which will be dmed by the Rapidshard bot.\n\n` +
//                     `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
//                 .setFields({name: `_ _`,value: "👑 Winner```js\n"+`${winner.user.username}#${winner.user.discriminator}`+"```", inline: false})
//                 .setFooter(`${function_name} ${version}`);
//             await message.edit({embeds: [debug]});
//         }
//     } else if (redeemableType === 2) {
//         // full game
//         // does have an image
//         if (ImageLink !== "None") {
//             const debug = new MessageEmbed()
//                 .setColor("#3288de")
//                 .setTitle(`${gameName} GIVEAWAY @${giveawayDate} CET`)
//                 .setThumbnail('https://i.imgur.com/BOUt2gY.png')
//                 .setDescription(`👏 **${member.user.username}#${member.user.discriminator}** is giving away a full game copy of **${gameName}.**` +
//                     `\n\nℹ️ Supported platform: **${platform}**` +
//                     `\n\n👉 The winner will receive a digital key for the game which will be dmed by the Rapidshard bot.\n\n` +
//                     `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
//                 .setFields({name: `_ _`,value: "👑 Winner```js\n"+`${winner.user.username}#${winner.user.discriminator}`+"```", inline: false})
//                 .setImage(`${ImageLink}`)
//                 .setFooter(`${function_name} ${version}`);
//             await message.edit({embeds: [debug]});
//         } else {
//             // does not have an image
//             const debug = new MessageEmbed()
//                 .setColor("#3288de")
//                 .setTitle(`${gameName} GIVEAWAY @${giveawayDate} CET`)
//                 .setThumbnail('https://i.imgur.com/BOUt2gY.png')
//                 .setDescription(`👏 **${member.user.username}#${member.user.discriminator}** is giving away a full game copy of **${gameName}.**` +
//                     `\n\nℹ️ Supported platform: **${platform}**\nIf you` +
//                     `\n\n👉 The winner will receive a digital key for the game which will be dmed by the Rapidshard bot.\n\n` +
//                     `🍋 To participate, react to the check below and you'll be put into a random draw at the given date.\n\n🐻 This draw is free.`)
//                 .setFields({name: `_ _`,value: "👑 Winner```js\n"+`${winner.user.username}#${winner.user.discriminator}`+"```", inline: false})
//                 .setFooter(`${function_name} ${version}`);
//             await message.edit({embeds: [debug]});
//         }
//     } else {
//         return console.error("Published redeemable type not 1 or 2.")
//     }
// }
//
// //winner embed message
// async function winnerEmbed(member, textChannel, guild, gameName, redeemableType, DlcName, ImageLink, date, message, platform, winner, key){
//
//     // is a DLC
//     if (redeemableType === 1) {
//         // does have an image
//         if (ImageLink !== "None") {
//             const debug = new MessageEmbed()
//                 .setColor("#3288de")
//                 .setTitle(`Congratulations **${winner.user.username}#${winner.user.discriminator}**`)
//                 .setThumbnail('https://i.imgur.com/BOUt2gY.png')
//                 .setDescription(`👑 You've won ${gameName} DLC (${DlcName}) courtesy of **${member.user.username}#${member.user.discriminator}**.` +
//                     `\n\nℹ️ Supported platform: **${platform}**\nIf you feel that you don't want the key anymore before redeeming it, please feel free to give it to someone else or ask a staff to redraw it.\n\n👉 Find out more: <#${textChannel.id}>`)
//                 .setFields({name: `_ _`,value: "🔑 Your key, enjoy```js\n"+`${key}`+"```", inline: false})
//                 .setImage(`${ImageLink}`)
//                 .setFooter(`${function_name} ${version}`);
//             await winner.send({embeds: [debug]});
//         } else {
//             // does not have an image
//             const debug = new MessageEmbed()
//                 .setColor("#3288de")
//                 .setTitle(`Congratulations **${winner.user.username}#${winner.user.discriminator}**`)
//                 .setThumbnail('https://i.imgur.com/BOUt2gY.png')
//                 .setDescription(`👑 You've won **${gameName} DLC (${DlcName})** courtesy of **${member.user.username}#${member.user.discriminator}**.` +
//                     `\n\nℹ️ Supported platform: **${platform}**\nIf you feel that you don't want the key anymore before redeeming it, please feel free to give it to someone else or ask a staff to redraw it.\n\n👉 Find out more: <#${textChannel.id}>`)
//                 .setFields({name: `_ _`,value: "🔑 Your key, enjoy```js\n"+`${key}`+"```", inline: false})
//                 .setFooter(`${function_name} ${version}`);
//             await winner.send({embeds: [debug]});
//         }
//     } else if (redeemableType === 2) {
//         // full game
//         // does have an image
//         if (ImageLink !== "None") {
//             const debug = new MessageEmbed()
//                 .setColor("#3288de")
//                 .setTitle(`Congratulations **${winner.user.username}#${winner.user.discriminator}**`)
//                 .setThumbnail('https://i.imgur.com/BOUt2gY.png')
//                 .setDescription(`👑 You've won a copy of **${gameName}** courtesy of **${member.user.username}#${member.user.discriminator}**.` +
//                     `\n\nℹ️ Supported platform: **${platform}**\nIf you feel that you don't want the key anymore before redeeming it, please feel free to give it to someone else or ask a staff to redraw it.\n\n👉 Find out more: <#${textChannel.id}>`)
//                 .setFields({name: `_ _`,value: "🔑 Your key, enjoy```js\n"+`${key}`+"```", inline: false})
//                 .setImage(`${ImageLink}`)
//                 .setFooter(`${function_name} ${version}`);
//             await winner.send({embeds: [debug]});
//         } else {
//             // does not have an image
//             const debug = new MessageEmbed()
//                 .setColor("#3288de")
//                 .setTitle(`Congratulations **${winner.user.username}#${winner.user.discriminator}**`)
//                 .setThumbnail('https://i.imgur.com/BOUt2gY.png')
//                 .setDescription(`👑 You've won a copy of **${gameName}** courtesy of **${member.user.username}#${member.user.discriminator}**.` +
//                     `\n\nℹ️ Supported platform: **${platform}**\nIf you feel that you don't want the key anymore before redeeming it, please feel free to give it to someone else or ask a staff to redraw it.\n\n👉 Find out more: <#${textChannel.id}>`)
//                 .setFields({name: `_ _`,value: "🔑 Your key, enjoy```js\n"+`${key}`+"```", inline: false})
//                 .setFooter(`${function_name} ${version}`);
//             await winner.send({embeds: [debug]});
//         }
//     } else {
//         return console.error("Published redeemable type not 1 or 2.")
//     }
// }
