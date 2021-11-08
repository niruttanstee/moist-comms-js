/*
* This is to purely test if the database is functioning.
* when someone says check it adds the user in the database and prints it out.
 */
const mysql = require("mysql");
const connection = mysql.createConnection({
    host: 'server.rapidshard.com',
    user: "u4_qt3ntoxea2",
    password: "U1FRSM2m2w0BwGZZD@98do.d",
    database: "s4_discord"
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

        let insertData = `INSERT INTO test (user) VALUES ("${author}")`;
        connection.query(insertData, function (err, result) {
            if (err) throw err;
            console.log(`1 record inserted`);
        });
        connection.query(`SELECT * FROM test`, async function (err, result, fields) {
            if (err) throw err;
            let reee = result[1];
            console.log(reee)
            await message.channel.send(`${reee}`)
        });


    },
};