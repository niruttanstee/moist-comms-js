const dayjs = require("dayjs");
const mysql = require("mysql");
const {database_host, port, database_username, database_password, database_name} = require("../database.json");
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

        await checkDatabase(messageID, guild, user, channel);

        async function checkDatabase(messageID, guild, user, channel) {
            // mysql connection and check for event handling
            let database = mysql.createConnection({
                host: database_host,
                port: port,
                user: database_username,
                password: database_password,
                database: database_name
            });

            database.connect(function (err) {
                if (err) throw err;
                console.log(`${dayjs()}: Database connected.`);
            });
            database.query("SELECT * FROM temporaryChannelProperties", async function (err, result, fields) {
                if (err) throw err;
                for (let i = 0; i < result.length; i++) {

                    if (result[i].guildID === guild.id && result[i].setupMessageID === messageID && result[i].ownerUserID === user.id) {
                        console.log(`${dayjs()}: Reaction event detected for temporary channel setup.`);
                        return await setupTempChannel(user, channel, guild);
                    }
                }
            });
        }
    }
}