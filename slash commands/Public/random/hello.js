const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ComponentType  } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("hello")
		.setDescription("Says hello"),
	async execute(interaction) {
		const images = [
			"https://cdn.discordapp.com/attachments/682468880676815036/1008118714241134663/008629c50c10499f0f37b170190d1a6f.gif",
			"https://cdn.discordapp.com/attachments/682468880676815036/1008118751880806582/debbie-balboa-animation-artwork-cute-desktop-wallpaper-anime-scenery-wallpaper.gif",
			"https://cdn.discordapp.com/attachments/682468880676815036/1008118796688572447/purple.gif"]
		const imageIndex = Math.floor(Math.random() * images.length)

		const playEmbed = new EmbedBuilder()
							.setTitle("No u")
                            .setImage(images[imageIndex])

		await interaction.reply({ embeds: [playEmbed] })
	},
};