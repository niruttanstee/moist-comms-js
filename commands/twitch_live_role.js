/*
* This is to purely test if the database is functioning.
* when someone says check it adds the user in the database and prints it out.
 */
const dayjs = require('dayjs');
const mysql = require("mysql");

module.exports = {
    name: "check",
    description: "check database",
    // put all functions in the execute() function
    async execute(newMember) {
        console.log(newMember.activity);


    }
};

