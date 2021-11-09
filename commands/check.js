/*
* This is to purely test if the database is functioning.
* when someone says check it adds the user in the database and prints it out.
 */
const dayjs = require('dayjs');
const mysql = require("mysql");

const {database_host} = require('./info.json');
const {database_username} = require('./info.json');
const {database_password} = require('./info.json');
const {database_name} = require('./info.json');
const {port} = require('./info.json');

const connection = mysql.createConnection({
    host: database_host,
    user: database_username,
    password: database_password,
    database: database_name,
    port: port
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});


module.exports = {
    name: "check",
    description: "check database",
    // put all functions in the execute() function
    async execute(presenceUpdate) {




    }
};

