const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ComponentType  } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("hello")
		.setDescription("Says hello"),
	async execute(interaction) {
		await interaction.reply({ content: "Hello!" })
	},
};