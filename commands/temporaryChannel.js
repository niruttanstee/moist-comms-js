/*
 * temporaryChannel
 * A function that creates a temporary channel for users when they join a certain channel. Once all users have left
 * that channel, the channel deletes automatically.
 * Functions:
 * setup creation channel, change temporary channel properties, create temporary channel, move user to channel,
 * check channel empty, delete channel, lock channel, unlock channel, request to join channel / accept by reacting,
 * add user to channel manually, change channel name(with limiter, option by premium and by setup),
 * change channel limit(option by premium and by setup), change channel bitrate(option by premium and by setup)
 */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
const wait = require('util').promisify(setTimeout);
const dayjs = require('dayjs');
const mysql = require('mysql');

const function_name = "RapidShard | Temporary Channel"
const version = 0.2;

const {database_host, port, database_username, database_password, database_name} = require("../database.json");

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

module.exports = {

    data: new SlashCommandBuilder()
        .setName('tempchannel')
        .setDescription('Temporary channel function.')
        .setDefaultPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup temporary channel.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('commands')
                .setDescription('All available commands for temporary channel.')),

    async execute(interaction) {

        // initialise all variables
        const channel = interaction.channel;
        const guild = interaction.guild;
        const member = interaction.member;

        // check sub commands
        if (interaction.options.getSubcommand() === 'setup') {
            console.log(`${dayjs()}: ${member.displayName} initiated tempchannel setup.`);
            await startup(channel, guild, member, interaction);
        } else if (interaction.options.getSubcommand() === 'commands') {
            console.log(`${dayjs()}: ${member.displayName} initiated tempchannel commands.`);
            return await allCommands(interaction);
        }
        // below are all function exports
    }, setupTempChannel, autoSetup
};

//setup stage: ask for setup confirmation
async function startup(channel, guild, member, interaction) {
    const startupEmbed = new MessageEmbed()
        .setColor("#3288de")
        .setTitle(`Function loading...`)

    await interaction.reply({embeds: [startupEmbed]})
        .then(await tempchannelSetup(channel, guild, member))
        .catch(console.error);
}

//sets up temporary channel, checks if user is ready to proceed and then connect to database
async function tempchannelSetup(channel, guild, member){
    const setupEmbed = new MessageEmbed()
        .setColor("#3288de")
        .setTitle("1. Temporary Channel Setup")
        .setDescription(`The setup process is ready to start.\n\nIf you’ve already setup the temporary channel before, your previous progress will be lost.\n\n👉 **Do you wish to continue?**`)
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setFooter(`${function_name} ${version}`);
    const message = await channel.send({ embeds: [setupEmbed]});

    database.query("SELECT * FROM temporaryChannelProperties", function (err, result, fields){
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            if (result[i].guildID === guild.id){
                let sql = `UPDATE temporaryChannelProperties SET setupMessageID = (${message.id}) WHERE guildID = (${guild.id})`;
                database.query(sql, function(err, result) {
                    if (err) throw err;
                });
                return console.log(`${dayjs()}: setupMessageID updated.`);
            }
        }
        let sql = `INSERT INTO temporaryChannelProperties (guildID, setupMessageID, ownerUserID) VALUES (${guild.id}, ${message.id}, ${member.id})`;
        database.query(sql, function(err, result) {
            if (err) throw err;
        });
        return console.log(`${dayjs()}: 1 record inserted.`);
    });

    // add reactions for the embed message
    await message.react(message.guild.emojis.cache.get('868172184152064070'));
    await message.react(message.guild.emojis.cache.get('868172332978548736'));
}

//event listener to setup temporary channel
async function setupTempChannel(user, channel, guild) {
    // call getVoiceCategory
    await getVoiceCategoryEmbed(channel);
    if (await getVoiceCategory(user, channel, guild)){
        await getTextCategoryEmbed(channel);
        if (await getTextCategory(user, channel, guild)){
            await getBitrateEmbed(channel);
            if (await getDefaultChannelBitrate(user, channel, guild)){
                await getUserLimitEmbed(channel)
                if (await getDefaultUserLimit(user, channel, guild)){
                    await wait(500);
                    return reviewProperties(user, channel, guild);
                }
            }
        }
    }
}

// RapidShard automated setup of channel
async function autoSetup(user, channel, guild){

    // embed that sends out setting up information and updates whenever something is done.
    let message = await autoSetupEmbed(channel);

    // field 0: Connection to RapidShard server // field 4: Progress processing
    await updateField1(message);

    // get all data params to setup creation channel

    // query to fetch voice category to create creation channel
    database.query("SELECT * FROM temporaryChannelProperties", async function (err, result, fields) {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            if (result[i].guildID === guild.id) {
                const voiceCategoryID = result[i].voiceCategoryID;

                // process voiceCategoryID to create voice creation channel
                let voiceCategory = guild.channels.fetch(voiceCategoryID)
                    .then(async category => {
                        let creationChannel = await category.createChannel("👋 Create a channel", {type: "GUILD_VOICE", bitrate: 8000, position: 0, rateLimitPerUser: 10});

                        //field 2: Creating Creation Channel // field 4: Progress processing
                        await updateField3(message);

                        // append creation channel ID to database
                        let sql = `UPDATE temporaryChannelProperties SET creationChannelID = ${creationChannel.id} WHERE guildID = ${guild.id}`;
                        database.query(sql, function (err, result) {
                                if (err) throw err;
                                console.log(`${dayjs()}: creationChannelID updated.`);
                            }
                        );
                        //field 3: Add spice and magic // field 4: Progress done
                        await updateField4(message);
                        return true;

                    }).catch(console.error)
            }
        }
    });
}

// function that checks all user inputs and creates a reaction for user to confirm, otherwise they can go in and
// edit individual parameters
async function reviewProperties(user, channel, guild) {
    // query to fetch all details
    database.query("SELECT * FROM temporaryChannelProperties", async function (err, result, fields) {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            if (result[i].guildID === guild.id) {
                const voiceCategoryID = result[i].voiceCategoryID;
                const textCategoryID = result[i].textCategoryID;
                const channelBitrate = result[i].channelBitrate;
                const channelUserLimit = result[i].channelUserLimit;

                let voiceCategoryObj = await guild.channels.fetch(voiceCategoryID);
                let textCategoryObj = await guild.channels.fetch(textCategoryID);

                let messageID = await reviewPropertiesEmbed(channel, voiceCategoryObj, textCategoryObj, channelBitrate, channelUserLimit);

                // append database of new messageID
                let sql = `UPDATE temporaryChannelProperties
                           SET reviewMessageID = ${messageID}
                           WHERE guildID = ${guild.id}`;
                database.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log(`${dayjs()}: textCategoryID updated.`);
                    }
                );
                return await checkEditCalls(user, channel, guild);
            }
        }
    })
}


// check if user edit calls
async function checkEditCalls(user, channel, guild){

    for (let i = 1; i <= 5; i++){
        // check user edit calls
        const filter = m => m.author.id === user.id && m.channel.id === channel.id;
        try {
            const collected = await channel.awaitMessages({filter, max: 1, time: 60_000});
            const response = collected.first();


            // process response
            if (await hasSymbol(response.content)) {
                // loop parameters unsuccessful
                await errorNotFoundEmbed(i, "Edit (number) / Confirm text", channel);
            } else if (await hasLetter(response.content)) {

                // check if confirm
                if (response.content.toLowerCase() === "confirm") {
                    return await autoSetup(user,channel, guild);
                }

                // loop parameters unsuccessful
                await errorNotFoundEmbed(i, "Edit (number) / Confirm text", channel);
            } else {
                let numContent = Number(response.content);
                // check if number is in range
                if (numContent > 4 || numContent <= 0) {
                    // loop parameters unsuccessful
                    await errorNotFoundEmbed(i, "Edit (number) / Confirm text", channel);
                } else {
                    if (numContent === 1) {
                        await getVoiceCategoryEmbed(channel);
                        if (await getVoiceCategory(user, channel, guild)) {
                            await wait(500)
                            return reviewProperties(user, channel, guild);
                        }
                    } else if (numContent === 2) {
                        await getTextCategoryEmbed(channel);
                        if (await getTextCategory(user, channel, guild)) {
                            await wait(500)
                            return reviewProperties(user, channel, guild);
                        }
                    } else if (numContent === 3) {
                        await getBitrateEmbed(channel);
                        if (await getDefaultChannelBitrate(user, channel, guild)) {
                            await wait(500)
                            return reviewProperties(user, channel, guild);
                        }
                    } else if (numContent === 4) {
                        await getUserLimitEmbed(channel);
                        if (await getDefaultUserLimit(user, channel, guild)) {
                            await wait(500)
                            return reviewProperties(user, channel, guild);
                        }
                    } else {
                        await errorNotFoundEmbed(i, "Edit (number) / Confirm text", channel);
                    }
                }
            }
        } catch {

            // catch timeout error
            await sessionTimedOutEmbed(channel);
            return false;
        }
    }
    // parameters out of tries
    await sessionOutOfTriesEmbed(channel);
    return false;

}

//get voice categoryID and store it in the database
async function getVoiceCategory(user, channel, guild) {

    for (let i = 1; i <= 5; i++) {
        const filter = m => m.author.id === user.id && m.channel.id === channel.id;
        try {
            const collected = await channel.awaitMessages({filter, max: 1, time: 60_000});
            const response = collected.first();

            // process response
            let voiceCategoryID = response.content;
            voiceCategoryID.replace(/\s/g, "");

            // check if it is a category ID
            if (await checkCategoryID(voiceCategoryID, guild)) {

                // parameters are successfully checked
                let voiceCategory = await guild.channels.fetch(voiceCategoryID);
                await successDetectionCategoryID(voiceCategory, channel);

                let sql = `UPDATE temporaryChannelProperties
                           SET voiceCategoryID = ${voiceCategory.id}
                           WHERE guildID = ${guild.id}`;
                database.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(`${dayjs()}: voiceCategoryID updated.`);
                });

                return true;
            } else {

                // loop parameters unsuccessful
                await errorNotFoundEmbed(i, "Category ID", channel);
            }
        } catch {
            // catch timeout error
            await sessionTimedOutEmbed(channel);
            return false;
        }
    }

    // parameters out of tries
    await sessionOutOfTriesEmbed(channel);
    return false;
}

//get text categoryID and store it in the database
async function getTextCategory(user, channel, guild) {

    for (let i = 1; i <= 5; i++){
        const filter = m => m.author.id === user.id && m.channel.id === channel.id;
        try{
            const collected = await channel.awaitMessages({filter, max: 1, time: 60_000});
            const response = collected.first();

            // process response
            let textCategoryID = response.content;
            textCategoryID.replace(/\s/g, "")
            if (await checkCategoryID(textCategoryID, guild)){
                let textCategory = await guild.channels.fetch(textCategoryID);
                await successDetectionCategoryID(textCategory, channel);

                let sql = `UPDATE temporaryChannelProperties SET textCategoryID = ${textCategory.id} WHERE guildID = ${guild.id}`;
                database.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(`${dayjs()}: textCategoryID updated.`);
                });

                return true;

            } else {

                // loop parameters unsuccessful
                await errorNotFoundEmbed(i, "Category ID", channel);
            }

        } catch {

            // catch timeout error
            await sessionTimedOutEmbed(channel);
            return false;
        }
    }

    // parameters out of tries
    await sessionOutOfTriesEmbed(channel);
    return false;
}

// get default channel bitrate
async function getDefaultChannelBitrate(user, channel, guild) {
    const lowBitrate = {name: "low", kps: 32_000};
    const normalBitrate = {name: "normal", kps: 64_000};
    const highBitrate = {name: "high", kps: 96_000};
    const bitrateValues = {lowBitrate, normalBitrate, highBitrate}

    for (let i = 1; i <= 5; i++) {
        const filter = m => m.author.id === user.id && m.channel.id === channel.id;
        try {
            const collected = await channel.awaitMessages({filter, max: 1, time: 60_000});
            const response = collected.first();

            // process response
            let bitrate = await bitrateChecker(response.content, bitrateValues);
            if (bitrate === false) {
                await errorNotFoundEmbed(i, "Bitrate", channel);
            } else {

                let sql = `UPDATE temporaryChannelProperties SET channelBitrate = ${bitrate} WHERE guildID = ${guild.id}`;
                database.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(`${dayjs()}: channelBitrate updated.`);
                });

                await successDetectionElement(`Bitrate`, channel)
                return true;
            }
        } catch {

            // catch timeout error
            await sessionTimedOutEmbed(channel);
            return false;
        }
    }

    // parameters out of tries
    await sessionOutOfTriesEmbed(channel);
    return false;
}

// get default user limit
async function getDefaultUserLimit(user, channel, guild) {

    for (let i = 1; i <= 5; i++) {
        const filter = m => m.author.id === user.id && m.channel.id === channel.id;
        try {
            const collected = await channel.awaitMessages({filter, max: 1, time: 60_000});
            const response = collected.first();

            // process response
            let userLimit = await userLimitChecker(response.content);
            if (userLimit === false){
                await errorNotFoundEmbed(i, "User limit (number)", channel);
            } else {

                let sql = `UPDATE temporaryChannelProperties
                           SET channelUserLimit = ${userLimit}
                           WHERE guildID = ${guild.id}`;
                database.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(`${dayjs()}: userLimit record updated.`);
                });

                await successDetectionElement(`User limit (${userLimit})`, channel)
                return true;
            }
        } catch {

            // catch timeout error
            await sessionTimedOutEmbed(channel);
            return false;
        }
    }
    // parameters out of tries
    await sessionOutOfTriesEmbed(channel);
    return false;
}

//update field4 of autoStart embed
async function updateField4(message){
    const updateField = new MessageEmbed()
        .setColor("#3288de")
        .setTitle("7. Setting everything up!")
        .setDescription("This will take a few seconds, please be patient.")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setFields(
            {name: '<:check:868172184152064070> Connect to RapidShard Server', value: '_ _', inline: false},
            {name: '<:check:868172184152064070> Spawn Creation Channel', value: '_ _', inline: false},
            {name: '<:check:868172184152064070> Add Spice and Magic', value: '_ _', inline: false},
            {name: 'Progress: (Completed)', value:'The temporary channel is ready to be used. If you ever need to change the properties, feel free to edit it individually using slash (/) commands, or alternatively by using the setup command.\n\nBrought to you by RapidShard.', inline: false}
        )
        .setFooter(`${function_name} ${version}`);
    await message.edit({embeds: [updateField]});
}

//update field3 of autoStart embed
async function updateField3(message){
    const updateField = new MessageEmbed()
        .setColor("#3288de")
        .setTitle("7. Setting everything up!")
        .setDescription("This will take a few seconds, please be patient.")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setFields(
            {name: '<:check:868172184152064070> Connect to RapidShard Server', value: '_ _', inline: false},
            {name: '<:check:868172184152064070> Spawn Creation Channel', value: '_ _', inline: false},
            {name: '<:cross:868172332978548736> Add Spice and Magic', value: '_ _', inline: false},
            {name: 'Progress: (Processing)', value: '_ _', inline: false}
        )
        .setFooter(`${function_name} ${version}`);
    await message.edit({embeds: [updateField]});
}

//update field1 of autoStart embed
async function updateField1(message){
    const updateField = new MessageEmbed()
        .setColor("#3288de")
        .setTitle("7. Setting everything up!")
        .setDescription("This will take a few seconds, please be patient.")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setFields(
            {name: '<:check:868172184152064070> Connect to RapidShard Server', value: '_ _', inline: false},
            {name: '<:cross:868172332978548736> Spawn Creation Channel', value: '_ _', inline: false},
            {name: '<:cross:868172332978548736> Add Spice and Magic', value: '_ _', inline: false},
            {name: 'Progress: (Processing)', value: '_ _', inline: false}
        )
        .setFooter(`${function_name} ${version}`);
    await message.edit({embeds: [updateField]});
}

// Embed for autoSetup with updaters
async function autoSetupEmbed(channel) {
    let setupEmbed = new MessageEmbed()
        .setColor("#3288de")
        .setTitle("7. Setting everything up!")
        .setDescription("This will take a few seconds, please be patient.")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .addFields(
            // field 0: Connect to RapidShard server
            {name: '<:cross:868172332978548736> Connect to RapidShard Server', value: '_ _', inline: false},
            //field 2: Spawn Creation Channel
            {name: '<:cross:868172332978548736> Spawn Creation Channel', value: '_ _', inline: false},
            //field 3: Add spice and magic
            {name: '<:cross:868172332978548736> Add Spice and Magic', value: '_ _', inline: false},
            //Update same time as field 3 | field 4: Progress
            {name: 'Progress: (Processing)', value: '_ _', inline: false}
        )
        .setFooter(`${function_name} ${version}`);
    let message = await channel.send({embeds: [setupEmbed]});
    return message;
}

// Embed function for review stage
async function reviewPropertiesEmbed(channel, voiceCategoryObj, textCategoryObj, channelBitrate, channelUserLimit){
    const reviewPropertiesEmbed = new MessageEmbed()
        .setColor("#3288de")
        .setTitle(`6. Review Your Setup`)
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setDescription(`Check if everything here looks fine. You can go back and edit each properties by entering the available number(s), or proceed to confirm the details, and we'll set everything up for you.\n\n**Here are your details:**\n**1** > Voice Creation Category > ${voiceCategoryObj.name}\n**2** > Text Creation Category > ${textCategoryObj.name}\n**3** > Default Bitrate > ${channelBitrate} kbps\n**4** > Default User Limit > ${channelUserLimit} user(s)\n\n👉 **Confirm** > to complete setup`)
        .setFooter(`${function_name} ${version}`);
    let message = await channel.send({embeds: [reviewPropertiesEmbed]});
    return message.id;
}

// Embed for getVoiceCategory startup
async function getVoiceCategoryEmbed(channel){
    const getVoiceCategoryEmbed = new MessageEmbed()
        .setColor("#3288de")
        .setTitle(`2. Enter Voice Creation Category ID`)
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setImage('https://i.imgur.com/ekIhDJy.gif')
        .setDescription(`The voice creation category is where your temporary voice channels will be created. It's also where the creation channel will be created. **The ID should be a long number.**\n\n If you can't copy the ID of the category, enable developer mode in the settings.`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [getVoiceCategoryEmbed]});
}

// Embed for getTextCategory startup
async function getTextCategoryEmbed(channel){
    const getTextCategoryEmbed = new MessageEmbed()
        .setColor("#3288de")
        .setTitle(`3. Enter Text Creation Category ID`)
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setImage('https://i.imgur.com/ekIhDJy.gif')
        .setDescription(`The text creation category is where your temporary text channels will be created. **The ID should be a long number**\n\nNote that you can also provide the same ID as the Voice Creation Category so both text and voice channels can be created within the same category.`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [getTextCategoryEmbed]});
}

//Embed for getBitrate startup
async function getBitrateEmbed(channel){
    const getDefaultChannelBitrateEmbed = new MessageEmbed()
        .setColor("#3288de")
        .setTitle(`4. Enter Default Channel Bitrate`)
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setDescription(`Channel bitrate dictates the audio quality of voice channels. Every new temporary voice channels created will default to this setting.\n\n**LOW** > recommended for people on poor connections.\n**NORMAL** > default standard for most servers.\n**HIGH** > highest possible, uses more bandwidth.\n`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [getDefaultChannelBitrateEmbed]});
}

// Embed for getUserLimit startup
async function getUserLimitEmbed(channel){
    const getDefaultUserLimitEmbed = new MessageEmbed()
        .setColor("#3288de")
        .setTitle(`5. Enter Default User Limit`)
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .setDescription(`The user limit prevents users from joining a full voice channel, and all new temporary voice channels will default to this. \n\n**Discord voice channels only accept numbers between 0-99.**\n**0** > no channel limit.\n**1-99** > sets (number) as channel limit.`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [getDefaultUserLimitEmbed]});
}

// Embed for error: not detected with tries
async function errorNotFoundEmbed(count, type, channel){
    const errorNotFound = new MessageEmbed()
        .setColor("#de3246")
        .setDescription(`**${type} has not been found, try again (${count}/5)**`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [errorNotFound]});
}

// Embed for successful detection of element
async function successDetectionElement(content, channel){
    const categorySuccessEmbed = new MessageEmbed()
        .setColor("#5bc04c")
        .setDescription(`**${content} confirmed...**`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [categorySuccessEmbed]});
}

// Embed for successful detection of category ID
async function successDetectionCategoryID(category, channel){
    const categorySuccessEmbed = new MessageEmbed()
        .setColor("#5bc04c")
        .setDescription(`**${category.name} confirmed...**`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [categorySuccessEmbed]});
}

// Embed for sessions that has timed out
async function sessionTimedOutEmbed(channel) {
    const textCategoryTimeout = new MessageEmbed()
        .setColor("#de3246")
        .setDescription(`**Session timed out**`)
        .setFooter(`${function_name} ${version}`);
    await channel.send({embeds: [textCategoryTimeout]});
}

//Embed for sessions out of tries
async function sessionOutOfTriesEmbed(channel) {
    const sessionOutOfTries = new MessageEmbed()
        .setColor("#de3246")
        .setDescription(`**Session out of tries**`)
        .setFooter(`${function_name} ${version}`);
    return await channel.send({embeds: [sessionOutOfTries]});
}

// function to check category id with guild
async function checkCategoryID(content, guild){

    let allChannels = new Map(await guild.channels.fetch())
    for (let i of allChannels.values()){
        if (i.type === "GUILD_CATEGORY" && i.id === content){
            return true;
        }
    }
    return false;
}

// function to check bitrate and convert to kps number
async function bitrateChecker(content, bitrateValues){
    let bitrate = content.toLowerCase();
    if (await hasNumber(bitrate)){
        return false;
    } else if (await hasSymbol(bitrate)){
        return false;
    }

    if (bitrate === bitrateValues.lowBitrate.name){
        return bitrateValues.lowBitrate.kps;
    } else if (bitrate === bitrateValues.normalBitrate.name){
        return bitrateValues.normalBitrate.kps;
    } else if (bitrate === bitrateValues.highBitrate.name){
        return bitrateValues.highBitrate.kps;
    } else {
        return false;
    }
}

// function to check user limit
async function userLimitChecker(content){
    if (await hasLetter(content)){
        return false;
    } else if (await hasSymbol(content)){
        return false;
    }
    if (content < 100){
        return content;
    } else {
        return false;
    }
}

// check if string has numbers
async function hasNumber(myString) {
    return /\d/.test(myString);
}
// check if string has letters
async function hasLetter(myString) {
    return /[a-z]/.test(myString);
}
// check if string has symbols
async function hasSymbol(myString) {
    let symbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    return symbols.test(myString);
}

//Embed of all commands
async function allCommands(interaction) {
    const debug = new MessageEmbed()
        .setColor("#3288de")
        .setTitle("All temporary channel commands")
        .setThumbnail('https://i.imgur.com/BOUt2gY.png')
        .addFields(
            { name: "Set name of your channel:", value: "```/set name```", inline: false },
            { name: "Set user limit of your channel:", value: "```/set userlimit```", inline: false },
            { name: "Set new owner of the channel:", value: "```/set owner```", inline: false },
            { name: "Lock your channel:", value: "```/lock```", inline: false },
            { name: "Unlock your channel:", value: "```/unlock```", inline: false },
            { name: "Grant user permission to join locked channel:", value: "```/grant```", inline: false },
            { name: "Request to join a locked channel:", value: "```/request join```", inline: false })
        .setFooter(`${function_name} ${version}`);
    return await interaction.reply({embeds: [debug]});

}