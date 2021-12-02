/*
*   Event handler to detect if user has joined a creation channel, and if so, create a temporary channel and move them
*   there. The channel will take properties from the parameter within the database.
*/
const dayjs = require("dayjs");
const mysql = require("mysql");
const {database_host, port, database_username, database_password, database_name} = require("../database.json");

module.exports = {
    name: 'voiceStateUpdate',

    async execute(oldState, newState) {
        // call get state
        let states = await getState(oldState, newState);
        // call checker function for joining
        if (await channelConnectCheck(states[0], states[2], states[3])){
            console.log(`${dayjs()}: ${states[2].displayName}'s room created.`)
        } else {
            // channel leave checker
            if (await channelDisconnectCheck(states[1], states[2], states[3])){
            }
        }


    }

};

async function getState(oldState, newState){
    // get parameters from member object
    const memberInChannelId = newState.channelId;
    const memberOutChannelId = oldState.channelId;
    const guild = oldState.guild;
    const member = newState.member;

    return [memberInChannelId, memberOutChannelId, member, guild];

}
    
// checker function that confirms if user is in creation channel or has left a channel
async function channelConnectCheck(memberInChannelId, member, guild) {
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
                const voiceCategoryID = result[i].voiceCategoryID;
                const textCategoryID = result[i].textCategoryID ;
                const bitrate = result[i].channelBitrate;
                const userLimit = result[i].channelUserLimit;

                return await createChannels(voiceCategoryID, textCategoryID, bitrate, userLimit, member, guild);
            }
        }
        return false;
    });

}

// create temporary channel: voice and text
async function createChannels(voiceCategoryID, textCategoryID, bitrate, userLimit, member, guild){
    // fetch parameters
    let voiceCategory = await guild.channels.fetch(voiceCategoryID);
    let textCategory = await guild.channels.fetch(textCategoryID);

    // create the channels
    let voiceChannel = await voiceCategory.createChannel(`${member.displayName}'s room`, {type: "GUILD_VOICE", bitrate: `${bitrate}`});
    let textChannel = await textCategory.createChannel(`${member.displayName}'s room`, {type: "GUILD_TEXT", position: 3});

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

    await moveMember(member, voiceChannel, guild);
}

// move member to channel
async function moveMember(member, channel, guild){
    await member.voice.setChannel(channel, "Temporary voice channel")
}

// function to check if user has left and if so, delete channel
async function channelDisconnectCheck(memberOutChannelId, member, guild){
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

    database.query("SELECT * FROM temporaryChannelLive", async function (err, result, fields) {
        if (err) throw err;

        for (let i = 0; i < result.length; i++) {

            if (result[i].guildId === guild.id && result[i].voiceChannelId === memberOutChannelId) {
                console.log(`${dayjs()}: ${member.displayName} has left a temporary channel.`);
                const voiceChannelId = result[i].voiceChannelId;
                const textChannelId = result[i].textChannelId;

                let voiceChannel = await guild.channels.fetch(voiceChannelId)
                    .then(channel => {
                    return channel;
                    }).catch(console.error);

                let textChannel = await guild.channels.fetch(textChannelId)
                    .then(channel => {
                        return channel;
                    }).catch(console.error);

                let memberSize = voiceChannel.members.size;

                // check if size
                if (memberSize == 0) {
                    if(await channelsDelete(voiceChannel, textChannel)){
                        console.log(`${dayjs()}: ${states[2].displayName}'s room deleted.`)

                        let sql = `DELETE FROM temporaryChannelLive WHERE voiceChannelId = ${memberOutChannelId}`;
                        database.query(sql, function (err, result) {
                            if (err) throw err;
                        });

                    }
                }
            }
        }
        return false;
    });
}

// function to delete voice channel and text channel if it is empty.
async function channelsDelete(voiceChannel, textChannel){
    try {
        await voiceChannel.delete();
    } catch {
        console.error("Couldn't delete voiceChannel.")
    }

    try {
        await textChannel.delete();
    } catch {
        console.error("Couldn't delete textChannel.")
    }
    return true;
}