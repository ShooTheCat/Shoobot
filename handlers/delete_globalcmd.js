const { Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
const path = require("node:path");
const { clientId, token } = require("../config.json");

module.exports = {
    async deleteGlobalCommands(cmdId, client) {
		client.application.commands.fetch(cmdId)
			.then(async (command) => {
				const slashcmdPath = path.join(__dirname, "../slash commands");
				const filePath = path.join(slashcmdPath, `${command.name}.js`);
				delete require.cache[require.resolve(filePath)];

				const rest = new REST({ version: '10' }).setToken(token);
				await rest.delete(Routes.applicationCommand(clientId, cmdId))
						.then(() => console.log("Successfully deleted global slash command"))
						.catch(console.error);
			}
		)
    },
};