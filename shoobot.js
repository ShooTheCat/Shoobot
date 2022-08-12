const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const { DisTube } = require("distube")
const { SpotifyPlugin } = require("@distube/spotify")
const { YtDlpPlugin } = require('@distube/yt-dlp')
const { token } = require("./config.json");
const { eventLoader } = require("./handlers/event_handler.js");
const { commandLoader } = require("./handlers/command_handler.js");
const { slashCommandLoader } = require("./handlers/slashcmnd_handler.js");
const { musicEventLoader } = require("./handlers/music_event_handler.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]});

client.commands = new Collection();
client.slashcommands = new Collection();
client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnEmpty: false,
    leaveOnStop: false,
    savePreviousSongs: true,
    nsfw: true,
    plugins: [
        new SpotifyPlugin(),
        new YtDlpPlugin()
    ]
});

module.exports = client
eventLoader(client);
commandLoader(client);
slashCommandLoader(client);
musicEventLoader(client);

client.login(token);