/*
* This is to purely test if the database is functioning.
* when someone says check it adds the user in the database and prints it out.
 */
const { database_username, database_password } = require('./config.json');
const mysql = require("mysql");
const connection = mysql.createConnection({
    host: '0.0.0.0',
    user: database_username,
    password: database_password,
    database: "s4_discord_moist_comms"
});

// connect to the MySQL server
connection.connect(function(err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
});

module.exports = {
    name: "check",
    description: "check database",
    // put all functions in the execute() function
    async execute(message) {
        let author = message.author;
        let sql = `INSERT INTO test (user) VALUES ("${author}")`;
        connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log(`1 record inserted: $`);
        });
    },
};