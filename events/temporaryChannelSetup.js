const dayjs = require("dayjs");
const mysql = require("mysql");
const { pool } = require("../db");
const {setupTempChannel, autoSetup} = require("../commands/temporaryChannel");
const {reviewProperties} = require("../commands/temporaryChannel");
module.exports = {
    name: 'messageReactionAdd',

    async execute(messageReaction, user) {
        if (user.bot) {
            return
        }

        const message = messageReaction.message;
        const messageID = message.id;
        const guild = message.guild;
        const channel = message.channel;

        await checkPool(messageID, guild, user, channel);

        async function checkPool(messageID, guild, user, channel) {
            pool.query(`SELECT * FROM "temporaryChannelProperties"`, async function (err, result, fields) {
                if (err) throw err;
                for (let i = 0; i < result.rows.length; i++) {

                    if (result.rows[i].guildID === guild.id && result.rows[i].setupMessageID === messageID && result.rows[i].ownerUserID === user.id) {
                        console.log(`${dayjs()}: Reaction event detected for temporary channel setup.`);
                        return await setupTempChannel(user, channel, guild);
                    }
                }
            });
        }
    }
}