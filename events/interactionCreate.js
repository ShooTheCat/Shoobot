const { InteractionType } = require("discord.js");

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

		if (interaction.isAutocomplete()) {
			const slashcommand = interaction.client.slashcommands.get(interaction.commandName);

			if (!slashcommand) return;

			try {
				await slashcommand.autocomplete(interaction);
			} catch (error) {
				console.log(error);
			};
		};

	},
};