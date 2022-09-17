const { InteractionType } = require("discord.js");
const { worldNames } = require('../utils/editedworldnames');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.type === InteractionType.ApplicationCommand) {
			const slashcommand = interaction.client.slashcommands.get(interaction.commandName);

			if (!slashcommand) return;

			try {
				await slashcommand.execute(interaction);
			} catch (error) {
				console.log(error);
				interaction.reply('Oops! Something went wrong.');
			}
		}

		if (interaction.type === InteractionType.ApplicationCommandAutocomplete && interaction.commandName === "wvwinfo") {
			try {
				const focusedValue = interaction.options.getFocused();
				if (focusedValue === '') {  		//If nothing is written return no search results
					await interaction.respond('')
				} else {
					const choices = worldNames;
					const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()));

					if (filtered.length >= 25) {		//Can't display more than 25 results with autocomplete
						const sliced = filtered.slice(0, 25);
						await interaction.respond(
							sliced.map(choice => ({ name: choice, value: choice })),
						);
					} else {
						await interaction.respond(
							filtered.map(choice => ({ name: choice, value: choice })),
						);
					};
				}

			} catch (error) {
				console.log(error)
			}
		}

	},
};