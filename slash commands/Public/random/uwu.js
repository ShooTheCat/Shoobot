const { SlashCommandBuilder } = require("discord.js");
const { uwuASCII } = require("../../../utils/uwus.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("uwu")
        .setDescription("UwU"),
    async execute(interaction) {
        
        const uwuIndex = Math.floor(Math.random() * uwuASCII.length);
        await interaction.reply(uwuASCII[uwuIndex]);

    },
};