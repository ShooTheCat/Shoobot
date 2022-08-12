const { Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
const fs = require("node:fs");
const path = require("node:path");
const { token, clientId, secretGuildId } = require("../config.json");

module.exports = {
    async slashCommandLoader(client) {
        let cmdAmount = 0;
        const globalSlashCommands = [];
        const slashcmdPath = path.join(__dirname, "../slash commands/Public");
        const slashcmdFolders = fs.readdirSync(slashcmdPath)

        for (const folder of slashcmdFolders) {
            const slashcmdFiles = fs.readdirSync(`${slashcmdPath}/${folder}`).filter(slashcmdFile => slashcmdFile.endsWith(".js"));
            
            for (const slashcmdFile of slashcmdFiles) { 
                const filePath = path.join(`${slashcmdPath}/${folder}`, slashcmdFile);
                delete require.cache[require.resolve(filePath)];  
                const slashcommand = require(filePath);
                client.slashcommands.set(slashcommand.data.name, slashcommand);
                globalSlashCommands.push(slashcommand.data.toJSON());
            };
            cmdAmount += slashcmdFiles.length
        };

        const secretSlashCmnds = [];
        const secretSlashCmndPath = path.join(__dirname, "../slash commands/Secret Shoo commands");
        const secretSlashCmndFiles = fs.readdirSync(secretSlashCmndPath).filter(secretSlashCmndFile => secretSlashCmndFile.endsWith('.js'));

        for (const secretSlashCmndFile of secretSlashCmndFiles) {
            const filePath = path.join(secretSlashCmndPath, secretSlashCmndFile);
            delete require.cache[require.resolve(filePath)];
            const secretSlashCmnd = require(filePath);
            client.slashcommands.set(secretSlashCmnd.data.name, secretSlashCmnd);
            secretSlashCmnds.push(secretSlashCmnd.data.toJSON());
        };

        console.log(`Loaded ${(client.slashcommands).size} out of ${(cmdAmount + secretSlashCmndFiles.length)} slash commands.`);

        const rest = new REST({ version: '10' }).setToken(token);

        async function deployGlobalCommands() {
            try {
                rest.put(Routes.applicationCommands(clientId), { body: globalSlashCommands });
                console.log(`Deployed ${globalSlashCommands.length} out of ${cmdAmount} global slash commands.`);
            } catch (error) {
                console.log(error);
            }
        };

        deployGlobalCommands();


        async function deploySecretGuildCommands() {
            try {
                rest.put(Routes.applicationGuildCommands(clientId, secretGuildId), { body: secretSlashCmnds });
                console.log(`Deployed ${secretSlashCmnds.length} out of ${secretSlashCmndFiles.length} guild slash commands.`);
            } catch (error) {
                console.log(error);
            }
        };

        deploySecretGuildCommands();
    },
};