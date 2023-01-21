const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle, ComponentType } = require("discord.js");
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

                    const tierBRow = new ActionRowBuilder();

                    const buttonAmount = (tierRegion == 2) ? 5 : 4;

                    for (let i = 0; i < buttonAmount; i++) {
                        const tButton = new ButtonBuilder()
                            .setCustomId(`${i + 1}`)
                            .setLabel(`${i + 1}`)
                            .setStyle(ButtonStyle.Primary)
                        tierBRow.addComponents(tButton);
                    };

                    const sendTierInfo = await interaction.editReply({
                        embeds: tierInfo,
                        components: [tierBRow]
                    });

                    const tierCollector = sendTierInfo.createMessageComponentCollector({ componentType: ComponentType.Button, time: 180000 });

                    tierCollector.on('collect', async (i) => {
                        if (i.user.id === interaction.user.id) {
                            const updateTierInfo = await TierInfo(tierRegion, i.customId);
                            await i.update({
                                embeds: updateTierInfo,
                                components: [tierBRow]
                            });
                            await wait(2000);

                        } else {
                            i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
                        };
                    });

                    tierCollector.on('end', (collected) => {
                        interaction.followUp({ content: 'Buttons expired', ephemeral: true })
                    });

                    break;

                case 'servers':
                    const serverRegion = interaction.options.getSubcommandGroup();
                    const serverName = interaction.options.getString('name');
                    if (worldNames[serverRegion].includes(serverName)) {
                        const serverInfo = await ServerInfo(serverName);

                        const servSelectRow = new ActionRowBuilder();
                        const choices = worldNames[serverRegion];
                        const selectMenuOptions = [];

                        for (let i = 0; i < choices.length; i++) {
                            const selectMenuOption = {
                                label: choices[i],
                                value: choices[i]
                            };
                            selectMenuOptions.push(selectMenuOption);

                        };

                        const selectRows = [];

                        if (serverRegion == 'eu') {
                            const servSelectRow2 = new ActionRowBuilder();
                            const selectMenuTwoOptions = selectMenuOptions.slice(-13);

                            servSelectRow
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId('server-select')
                                        .setPlaceholder('EU servers #1')
                                        .addOptions(selectMenuOptions.slice(0, 14))
                                );
                            servSelectRow2
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId('server-select2')
                                        .setPlaceholder('EU servers #2')
                                        .addOptions(selectMenuTwoOptions)
                                );

                            selectRows.push(servSelectRow)
                            selectRows.push(servSelectRow2)
                        } else {
                            servSelectRow
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId('server-select')
                                        .setPlaceholder('NA servers')
                                        .addOptions(selectMenuOptions)
                                );
                            selectRows.push(servSelectRow)
                        };

                        const sendServerInfo = await interaction.editReply({
                            embeds: [serverInfo],
                            components: selectRows
                        });

                        const serverCollector = sendServerInfo.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 180000 });

                        serverCollector.on('collect', async (i) => {
                            if (i.user.id === interaction.user.id) {
                                const newServer = i.values[0];
                                const updateServInfo = await ServerInfo(newServer);
                                await i.update({
                                    embeds: [updateServInfo],
                                    components: selectRows
                                });
                                await wait(2000);

                            } else {
                                i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
                            };
                        })

                        serverCollector.on('end', (collected) => {
                            interaction.followUp({ content: 'Selection expired', ephemeral: true })
                        });

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