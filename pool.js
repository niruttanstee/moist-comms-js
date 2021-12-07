const {mysql} = require("mysql");
const {database_host, port, database_username, database_password, database_name} = require("database.json");

async function test(){
    mysql.createConnection({
        host: database_host,
        port: port,
        user: database_username,
        password: database_password,
        database: database_name
    })
}


module.exports = test;