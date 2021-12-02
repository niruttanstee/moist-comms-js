/*
*   Event handler to detect if user has joined a creation channel, and if so, create a temporary channel and move them
*   there. The channel will take properties from the parameter within the database.
*/

const dayjs = require("dayjs");
const mysql = require("mysql");
const {database_host, port, database_username, database_password, database_name} = require("../database.json");

module.exports = {
    name: 'voiceStateUpdate',

    async execute(oldMember, newMember) {
        // get parameters from member object
        const memberInChannelId = newMember.channelId;
        const memberOutChannelId = oldMember.channelId;
        const guild = oldMember.guild;
        const guildId = guild.id;
        const member = newMember.member;

        // call checker function for joining
        let creationProperties = await channelJoinCheck(memberInChannelId, memberOutChannelId, guildId, member)
        
        if (!creationProperties === false){
            // create a temp channel and move user to it
            await createChannels(creationProperties, guild, member);

        }// else if((// call checker fuction for leaving))

    }, channelJoinCheck, createChannels, moveMember

};
    
// checker function that confirms if user is in creation channel or has left a channel

async function channelJoinCheck(memberInChannelId, memberOutChannelId, guildId, member) {
    // database connection
    let database = mysql.createConnection({
        host: database_host,
        port: port,
        user: database_username,
        password: database_password,
        database: database_name
    });

    database.connect(function (err) {
        if (err) throw err;
    });

    database.query("SELECT * FROM temporaryChannelProperties", async function (err, result, fields) {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {

            if (result[i].guildID === guild.id && result[i].creationChannelID === memberInChannelId) {
                console.log(`${dayjs()}: ${member.displayName} has joined a creation channel.`);
                
                return result[i].voiceCategoryID, result[i].textCategoryID, result[i].channelBitrate, result[i].channelUserLimit;
            }
        }

        return false;
    });

}

// create temporary channel: voice and text
async function createChannels(creationProperties, guild, member){
    // fetch parameters
    let voiceCategory = await guild.channels.fetch(creationProperties[0]);
    let textCategory = await guild.channels.fetch(creationProperties[1]);
    let bitrate = creationProperties[2];
    let userLimit = creationProperties[3];

    // create the channels
    let voiceChannel = await voiceCategory.createChannel(`${member.displayName}'s room`, {type: "GUILD_VOICE", bitrate: `${bitrate}`});
    let textChannel = await textCategory.createChannel(`${member.displayName}'s room`, {type: "GUILD_TEXT"});

    // append ids to database
    // database connection
    let database = mysql.createConnection({
        host: database_host,
        port: port,
        user: database_username,
        password: database_password,
        database: database_name
    });

    database.connect(function (err) {
        if (err) throw err;
    });

    let sql = `INSERT INTO temporaryChannelLive (guildId, voiceChannelId, textChannelId, ownerId) VALUES (${guild.id}, ${voiceChannel.id}, ${textChannel.id}, ${member.id})`;
    database.query(sql, function(err, result) {
        if (err) throw err;
    });
    return console.log(`${dayjs()}: 1 record inserted.`);


}
// move member to channel
async function moveMember(member, channel, guild){
    return true;
}