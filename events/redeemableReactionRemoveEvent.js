// const dayjs = require("dayjs");
// const mysql = require("mysql");
// // const {database_host, port, database_username, database_password, database_name} = require("../database.json");
// const {removeParticipant} = require("../commands/redeemable");
// module.exports = {
//     name: 'messageReactionRemove',
//
//     async execute(messageReaction, user) {
//         if (user.bot) {
//             return
//         }
//
//         const message = messageReaction.message;
//         const guild = message.guild;
//         const channel = message.channel;
//
//         await checkDatabase(message, guild, user, channel);
//
//         async function checkDatabase(messageID, guild, user, channel) {
//             // mysql connection and check for event handling
//             // let database = mysql.createConnection({
//             //     host: database_host,
//             //     port: port,
//             //     user: database_username,
//             //     password: database_password,
//             //     database: database_name
//             // });
//
//             database.connect(function (err) {
//                 if (err) throw err;
//             });
//             database.query("SELECT * FROM redeemable", async function (err, result, fields) {
//                 if (err) throw err;
//                 for (let i = 0; i < result.length; i++) {
//
//                     if (result[i].publishedMessageId === message.id && result[i].publishedChannelId === channel.id) {
//                         console.log(`${dayjs()}: ${user.username} removed reaction on a redeemable event.`);
//                         if (messageReaction.emoji.id === "868172184152064070") {
//                             await removeParticipant(messageReaction, user, channel);
//                         }
//                     }
//                 }
//             });
//         }
//     }
// }