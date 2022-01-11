const dayjs = require("dayjs");
const schedule = require('node-schedule');

const arraySupport = require("dayjs/plugin/arraySupport");
const mysql = require("mysql");
const {database_host, port, database_username, database_password, database_name} = require("../database.json");
const {MessageEmbed} = require("discord.js");
dayjs.extend(arraySupport);
const guildId = "860934544693919744";
const wait = require('util').promisify(setTimeout);



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
        console.log(client)
        const guild = client.guilds.cache.get(guildId);
        console.log(guild);

        await help(client, guild);
    }
};

async function help(client, guild) {
    await wait(1200000);
    console.log(client);
    console.log(guild);
}