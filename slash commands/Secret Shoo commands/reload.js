const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { eventLoader } = require("../../handlers/event_handler.js");
const { commandLoader } = require("../../handlers/command_handler.js");
const { slashCommandLoader } = require("../../handlers/slashcmnd_handler.js");
const { musicEventLoader } = require("../../handlers/music_event_handler.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reload")
        .setDescription("Reload commands or events")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName("commands")
                .setDescription("Reload commands"))
        .addSubcommand(subcommand =>
            subcommand
                .setName("slash_commands")
                .setDescription("Reload slash commands"))
        .addSubcommand(subcommand =>
            subcommand
                .setName("events")
                .setDescription("Reload events")),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "commands":
                await commandLoader(interaction.client);
                await interaction.reply({content: "Reloaded the chat commands."});
                break;

            case "slash_commands":
                await slashCommandLoader(interaction.client);
                await interaction.reply({content: "Reloaded the slash commands."});
                break;
 
            case "events":
                await eventLoader(interaction.client);
                await musicEventLoader(interaction.client);
                await interaction.reply({content: "Reloaded the events."});
                break;
            default:
                break;
        }
    },
};