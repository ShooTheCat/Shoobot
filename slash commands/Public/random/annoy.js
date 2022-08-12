const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("annoy")
		.setDescription("Poke someone")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The person to annoy")
                .setRequired(true)),
	async execute(interaction) {
        const member = interaction.options.getMember('user');

        await interaction.reply({
            content: `${member}`
        });
	},
};