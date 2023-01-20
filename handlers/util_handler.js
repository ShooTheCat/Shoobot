const fs = require("node:fs");
const path = require("node:path");

module.exports = {
    async UtilLoader(client) {
        const utilPath = path.join(__dirname, "../utils");
        const utilFiles = fs.readdirSync(utilPath).filter(utilFile => utilFile.endsWith(".js"));
        const utilArray = [];

        for (const utilFile of utilFiles) {
            const filePath = path.join(utilPath, utilFile);
            delete require.cache[require.resolve(filePath)];
            const util = require(filePath);
            utilArray.push(util)
        };
        console.log(`Reloaded the utils.`);
    },  
};