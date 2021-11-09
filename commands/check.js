/*
* This is to purely test if the database is functioning.
* when someone says check it adds the user in the database and prints it out.
 */
const mysql = require("mysql");
const dayjs = require('dayjs');

const {database_local_host} = require('./info.json');
const {database_username} = require('./info.json');
const {database_password} = require('./info.json');
const {database_name} = require('./info.json');
const {port} = require('./info.json');

let connection = mysql.createConnection({
    host: "172.0.0.1",
    user: "u10_s3akpIO2UN",
    password: "0+z9S03dOJtM1T!@ZF7Gkp!z",
    database: "s10_discord"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = {
    name: "check",
    description: "check database",
    // put all functions in the execute() function
    async execute(message) {
        let user = message.author;
        console.log(`${dayjs()}: ${user.username} check[0], initialising.`)

        let userid = user.id;
        let channel = message.channel;
        let channel_id = channel.id;

        // check database if you has already been appended
        await checkDatabase(channel, message, user);

        async function checkDatabase(channel, message, user){
            console.log(`${dayjs()}: check[1] checkDatabase initiated.`)
            connection.query("SELECT * FROM test", async function (err, result, fields) {
                if (err) throw err;
                if (result.length === 0){
                    console.log("No user in database, append");
                    await message.channel.send("No user in database, append");
                    await addToDatabase(channel, message, user);
                }
                else {
                    for (let i = 0; i < result.length; i++){
                        console.log(`Checking ${result[i].user_id}`);
                        await message.channel.send(`Checking ${result[i].user_id}`);
                        if (user.id === result[i].user_id){
                            console.log(`User in database, not append`);
                            await message.channel.send(`User in database, not append`);
                            await postDatabase(channel, message, user);
                        }
                        else {
                            console.log(`User not in database, append`);
                            await message.channel.send(`User not in database, append`);
                            await addToDatabase(channel, message, user);
                        }
                    }
                }
            });

        }
        // add the user to the database
        async function addToDatabase(channel, message, user){
            console.log(`${dayjs()}: check[2] addToDatabase initiated.`)
            let userID = user.id
                connection.query(`INSERT INTO test VALUES (${userID})`, async function (err, result, fields) {
                    if (err) throw err;
                    console.log(`Database appended`);
                    await message.channel.send(`Database appended`);
                    await postDatabase(channel, message, user);
                });
        }
        // reply to user everyone in database
        async function postDatabase(channel, message, user){
            console.log(`${dayjs()}: check[3] postDatabase initiated.`)
            connection.query("SELECT * FROM test", async function (err, result, fields) {
                let list = [];
                if (err) throw err;
                for (let i = 0; i < result.length; i++){
                    list.push(`<@${result[i].user_id}>`)
                }
                await message.channel.send(`${list}`)
            });
        }

    }
};

