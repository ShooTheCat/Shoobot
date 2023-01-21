const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ComponentType } = require("discord.js");
const wait = require('node:timers/promises').setTimeout;
const { worldNames } = require('../../../utils/editedworldnames');
const { ServerInfo } = require('../../../utils/serverinfo');
const { TierInfo } = require('../../../utils/tierinfo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wvw')
        .setDescription('Reload commands or events')
        .addSubcommandGroup(group =>
            group
                .setName('eu')
                .setDescription('EU server and tier information')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('tiers')
                        .setDescription('Information about EU tiers')
                        .addIntegerOption(option =>
                            option
                                .setName('tier')
                                .setDescription('Tier number (1-5)')
                                .setMinValue(1)
                                .setMaxValue(5)
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('servers')
                        .setDescription('Information about a server on EU')
                        .addStringOption(option =>
                            option
                                .setName('name')
                                .setDescription('Server name')
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
        )
        .addSubcommandGroup(group =>
            group
                .setName('na')
                .setDescription('NA server and tier information')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('tiers')
                        .setDescription('Information about NA tiers')
                        .addIntegerOption(option =>
                            option
                                .setName('tier')
                                .setDescription('Tier number (1-4)')
                                .setMinValue(1)
                                .setMaxValue(4)
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('servers')
                        .setDescription('Information about a server on NA')
                        .addStringOption(option =>
                            option
                                .setName('name')
                                .setDescription('Server name')
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
        ),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const region = interaction.options.getSubcommandGroup();
        const choices = worldNames[region];
        const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()));

        if (filtered.length >= 25) {		//Can't display more than 25 results with autocomplete
            const sliced = filtered.slice(0, 25);
            await interaction.respond(
                sliced.map(choice => ({ name: choice, value: choice })),
            );
        } else {
            await interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            );
        };


    },
    async execute(interaction) {
        await interaction.deferReply();
        const subcom = interaction.options.getSubcommand();

        try {
            switch (subcom) {
                case 'tiers':
                    const tierRegion = interaction.options.getSubcommandGroup() == 'eu' ? 2 : 1; //2 for EU region, 1 for NA region
                    const tierId = interaction.options.getInteger('tier');
                    const tierInfo = await TierInfo(tierRegion, tierId);

                    const row = new ActionRowBuilder();

                    const buttonAmount = (region == 2) ? 5 : 4;

                    for (let i = 0; i < buttonAmount; i++) {
                        const tButton = new ButtonBuilder()
                            .setCustomId(`${i + 1}`)
                            .setLabel(`${i + 1}`)
                            .setStyle(ButtonStyle.Primary)
                        row.addComponents(tButton);
                    };

                    const sendTierInfo = await interaction.editReply({
                        embeds: tierInfo,
                        components: [row]
                    });

                    const tierCollector = sendTierInfo.createMessageComponentCollector({ componentType: ComponentType.Button, time: 180000 });

                    tierCollector.on('collect', async (i) => {
                        if (i.user.id === interaction.user.id) {
                            const updateTierInfo = await TierInfo(region, i.customId);
                            await i.update({
                                embeds: updateTierInfo,
                                components: [row]
                            });
                            await wait(2000);

                        } else {
                            i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
                        };
                    });

                    tierCollector.on('end', (collected) => {
                        interaction.channel.send({ content: 'Buttons expiered', ephemeral: true })
                    });

                    break;

                case 'servers':
                    const serverRegion = interaction.options.getSubcommandGroup();
                    const serverName = interaction.options.getString('name');
                    if (worldNames[serverRegion].includes(serverName)) {
                        ServerInfo(serverName);
                    } else {
                        interaction.editReply(`${serverName} is not a valid world!`)
                    }
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.log(error)
        }
    },
};