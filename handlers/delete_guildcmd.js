const { Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { clientId, token } = require("../config.json");

module.exports = {
    async deleteGuildCommands(cmdId, guild) {
        const rest = new REST({ version: '10' }).setToken(token);

        await rest.delete(Routes.applicationGuildCommand(clientId, guild, cmdId))
            .then(() => console.log('Successfully deleted guild command'))
            .catch(console.error);
    },
};
