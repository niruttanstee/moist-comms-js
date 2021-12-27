/*
 *  Function that uses RNG to do its function. Such as roll, as well as RNG name pickers.
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const {MessageEmbed} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolls using RNG.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('number')
                .setDescription('Rolls a number between 0 and 100.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('oddson')
                .setDescription('Rolls odds on between 1 and 5.')),
        // .addSubcommand(subcommand =>
        //     subcommand
        //         .setName('list')
        //         .setDescription('Rolls a list of strings.')
        //         .addStringOption(option => option.setName('list').setDescription('The list of string (seperated by commas)').setRequired(true))),

    async execute(interaction) {

        if (interaction.options.getSubcommand() === 'number') {
            return await rollNumber(interaction);
        } else if (interaction.options.getSubcommand() === 'list') {
            const list = interaction.options.getString('list');
            return await rollList(interaction, list);
        } else if (interaction.options.getSubcommand() === 'oddson') {
            return await oddsOn(interaction);
        }
    },
};

// roll number between 0 and 100.
async function rollNumber(interaction) {
    let number = Math.floor(Math.random() * 100) + 1;
    // Embed for successful detection of category ID
        const numberEmbed = new MessageEmbed()
            .setColor("#4cc0a5")
            .setTitle(`Rolled ${number}`)
        return await interaction.reply({embeds: [numberEmbed]});
}

// random roll a list of strings with a counter.
async function rollList(interaction, list) {

    await interaction.deferReply();

    let spaceList = list.replace(/\s/g,'');
    let splitList = spaceList.split(',') ;
    let reserved = [];
    let randomizedList = [];

    while (reserved.length !== splitList.length) {
        let findRandomNumber = true;
        while (findRandomNumber === true) {
            let randomNumber = Math.floor((Math.random() * splitList.length));
            if (!reserved.includes(randomNumber)) {
                reserved.push(randomNumber);
                break;
            }
        }
    }

    for (let i = 0; i < reserved.length; i++) {
        let index = reserved[i];
        randomizedList.push(`**${i+1}.** ${splitList[index]}\n`);
    }

    let outputList = "";

    for (let x = 0; x < reserved.length; x++) {
        let item = randomizedList[x];
        outputList += item;
    }

    const listEmbed = new MessageEmbed()
        .setColor("#4cc0a5")
        .setTitle(`Unboxing List`)
        .setDescription(`${outputList}`)

    return await interaction.editReply({embeds: [listEmbed]});

}

// oddsOn, rolls a number between 1 and 5

async function oddsOn(interaction) {

    let member = interaction.member;

    let odds = Math.floor(Math.random() * 5) + 1;
    const oddsOn = new MessageEmbed()
        .setColor("#4cc0a5")
        .setTitle(`Odds on, ${member.displayName} rolled ${odds}`)
    return await interaction.reply({embeds: [oddsOn]});

}