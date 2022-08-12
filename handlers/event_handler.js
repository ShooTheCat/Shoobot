const fs = require("node:fs");
const path = require("node:path");

module.exports = {
    async eventLoader(client) {
        const eventNames = [];
        const eventsPath = path.join(__dirname, "../events");
        const eventFiles = fs.readdirSync(eventsPath).filter(eventFile => eventFile.endsWith(".js"));

        for (const eventFile of eventFiles) {
            const filePath = path.join(eventsPath, eventFile);
            delete require.cache[require.resolve(filePath)];
            const event = require(filePath);
            client.removeAllListeners(event.name);
            if (event.once) {
                // client.removeAllListeners(event.name)
                await client.once(event.name, (...args) => event.execute(...args));
            } else {
                // client.removeAllListeners(event.name);
                await client.on(event.name, (...args) => event.execute(...args));
            }
            eventNames.push(event.name);
        };

        console.log(`Loaded ${eventNames.length} out of ${eventFiles.length} events.`);
    },
};