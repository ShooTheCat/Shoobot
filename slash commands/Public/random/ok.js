const { SlashCommandBuilder } = require("discord.js");
const { CAT_API_KEY } = require('../../../config.json');
const { fetch } = require("undici");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ok")
		.setDescription("Display a picture of a pretty ok cat"),
	async execute(interaction) {
        const apiKey = CAT_API_KEY;
		const response = await fetch('https://aws.random.cat/meow');
		const backupResponse = await fetch('https://api.thecatapi.com/v1/images/search', { headers: { 'x-api-key': apiKey } });

		if (response.status === 200) {
			const jsonResponse = await response.json();
            const picture = jsonResponse["file"];
			await interaction.reply(picture);
		} else if (backupResponse.status === 200) {
			const jsonResponse = await backupResponse.json();
            const picture = jsonResponse[0]["url"];
			await interaction.reply(picture);
		} else {
            await interaction.reply("Internet says: No cats for you :(")
        }

	},
};