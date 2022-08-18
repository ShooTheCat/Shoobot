const fs = require("node:fs");
const path = require("node:path");

module.exports = {
    async commandLoader(client) {
        const commandsPath = path.join(__dirname, "../chat commands");
        const commandFiles = fs.readdirSync(commandsPath).filter(commandFile => commandFile.endsWith(".js"));

        for (const commandFile of commandFiles) {
            const filePath = path.join(commandsPath, commandFile);
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);
            await client.commands.set(command.name, command);
        };
        console.log(`Loaded ${(client.commands).size} out of ${commandFiles.length} commands.`);
    },  
};