const dayjs = require("dayjs");
const { pool } = require("../db");
const {removeParticipant} = require("../commands/redeemable");
module.exports = {
    name: 'messageReactionRemove',

    async execute(messageReaction, user) {
        if (user.bot) {
            return
        }

        const message = messageReaction.message;
        const guild = message.guild;
        const channel = message.channel;

        await checkDatabase(message, guild, user, channel);

        async function checkDatabase(messageID, guild, user, channel) {

        pool.query(`SELECT * FROM "redeemable"`, async function (err, result, fields) {
                if (err) throw err;
                for (let i = 0; i < result.rows.length; i++) {
                    if (result.rows[i].publishedMessageId === message.id && result.rows[i].publishedChannelId === channel.id) {
                        console.log(`${dayjs()}: ${user.username} removed reaction on a redeemable event.`);
                        if (messageReaction.emoji.id === "868172184152064070") {
                            await removeParticipant(messageReaction, user, channel);
                        }
                    }
                }
            });
        }
    }
}