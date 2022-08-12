const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { deleteGlobalCommands } = require("../../handlers/delete_globalcmd.js");
const { deleteGuildCommands } = require("../../handlers/delete_guildcmd.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete")
        .setDescription("Delete global and guild commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName("global_command")
                .setDescription("Delete a global slash command")
                .addStringOption(option => option.setName('cmdid').setDescription("The ID of the global command").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("guild_command")
                .setDescription("Delete a guild slash comamnd")
                .addStringOption(option => option.setName('cmdid').setDescription("The ID of the guild command you want to delete").setRequired(true))
                .addStringOption(option => option.setName('guildid').setDescription("The ID of the guild you want to delete the command from").setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const commandId = interaction.options.getString("cmdid");
        const guildId = interaction.options.getString("guildid");
        
        switch (subcommand) {
            case "global_command":
                await deleteGlobalCommands(commandId, interaction.guild);
                await interaction.reply({content: "Deleted the global command."})
                break;

            case "guild_command":
                await deleteGuildCommands(commandId, guildId);
                await interaction.reply({content: "Deleted the guild command."});
                break;

            default:
                break;
        }
    },
};
//.addStringOption(option => option.setName('guildid').setDescription("The ID of the guild you want to delete the command from").setRequired(true))