const { SlashCommandBuilder } = require("discord.js");
const { fetch } = require("undici");
const { worldNames } = require('../../../utils/editedworldnames.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wvwinfo')
        .setDescription('Current WvW matchup information of a server')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name of something')
                .setRequired(true)
                .setAutocomplete(true)),
    async execute(interaction) {
        const worldName = interaction.options.getString('name');
        const worldsurl = `https://api.guildwars2.com/v2/worlds?ids=all`;
        const settings = { method: "Get" };

        try {
            fetch(worldsurl, settings)
                .then(response => response.json())
                .then((worlds) => {
                    if (worldNames.includes(worldName)) {
                        const worldId = getId(worldName);

                        // const worldColor = getColor();

                        function getId(worldName) {
                            for (let i = 0; i < worlds.length; i++) {
                                if (worlds[i].name === worldName) {
                                    return worlds[i].id;
                                }
                            }
                        };

                        const matchUrl = `https://api.guildwars2.com/v2/wvw/matches?world=${worldId}`;
                        const settings = { method: "Get" };

                        fetch(matchUrl, settings)
                            .then(response => response.json())
                            .then((json) => {
                                const tier = json['id'].slice(-1);
                                const matchupEndTime = json['end_time'];
                                const victoryPoints = json['victory_points'];
                                const allWorlds = json['all_worlds'];
                                const maps = json["maps"]
                                const mapScores = [];
                                const skirmishList = json['skirmishes'].slice(0, -1);
                                const skirmishScores = skirmishList.map(getScores);
                                let first = 0;
                                let second = 0;
                                let last = 0;
                                const kills = [];
                                const deaths = [];

                                const colour = getColour();

                                function getColour() {
                                    const allWorldIds = Object.values(allWorlds);

                                    for (let i = 0; i < allWorldIds.length; i++) {
                                        if (allWorldIds[i].includes(worldId)) {
                                            const colour = Object.keys(allWorlds).find(key => allWorlds[key] === allWorldIds[i]);
                                            return colour.charAt(0).toUpperCase() + colour.slice(1);
                                        }
                                    };
                                };

                                const embedColour = getEmbedColour()

                                function getEmbedColour() {
                                    if (colour == "Red") {
                                        return 12454410;
                                    } else if (colour == "Blue") {
                                        return 2197732;
                                    } else {
                                        return 184871;
                                    }
                                };

                                function getScores(skirmish) {
                                    return skirmish.scores;
                                }

                                skirmishScores.forEach(getSkirmishStandings);

                                function getSkirmishStandings(skirmishScores) {
                                    const worldColour = colour.toLowerCase()
                                    const min = Math.min(...Object.values(skirmishScores));
                                    const max = Math.max(...Object.values(skirmishScores));

                                    if (skirmishScores[worldColour] === min) last++;
                                    if (skirmishScores[worldColour] === max) first++;
                                    if (skirmishScores[worldColour] != min && skirmishScores[worldColour] != max) second++;

                                };

                                const placement = getPlacement(victoryPoints);

                                function getPlacement(vp) {
                                    const worldColour = colour.toLowerCase()
                                    const min = Math.min(...Object.values(vp));
                                    const max = Math.max(...Object.values(vp));

                                    if (vp[worldColour] === min) return 3;
                                    if (vp[worldColour] === max) return 1;
                                    if (vp[worldColour] != min && vp[worldColour] != max) return 2;
                                };

                                const structures = [[0, 0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
                                let currentPpt = 0;

                                for (let i = 0; i < maps.length; i++) {
                                    //for i: 0 = EB, 1 = Red Border, 2 = Green Border, 3 = Green Border
                                    mapScores.push(maps[i]["scores"][colour.toLowerCase()]);
                                    kills.push(maps[i]["kills"][colour.toLowerCase()]);
                                    deaths.push(maps[i]["deaths"][colour.toLowerCase()]);

                                    for (let n = 0; n < maps[i]["objectives"].length; n++) {
                                        if (maps[i]["objectives"][n]["owner"] === colour) {
                                            currentPpt += maps[i]["objectives"][n]["points_tick"];
                                            if (maps[i]["objectives"][n]["type"] === "Camp") structures[i][0]++ & structures[4][0]++;
                                            if (maps[i]["objectives"][n]["type"] === "Tower") structures[i][1]++ & structures[4][1]++;
                                            if (maps[i]["objectives"][n]["type"] === "Keep") structures[i][2]++ & structures[4][2]++;
                                            if (maps[i]["objectives"][n]["type"] === "Castle") structures[i][3]++ & structures[4][3]++;
                                        }
                                    };
                                };

                                const stoneMist = structures[0][3] === 1 ? "✅" : "❌";

                                const endTimeToMs = new Date(matchupEndTime).getTime();
                                const editedEndTime = time();

                                function time() {

                                    const currentTime = new Date().getTime();

                                    // Find the distance between now and the count down date
                                    const distance = endTimeToMs - currentTime;

                                    // Time calculations for days, hours, minutes and seconds
                                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                                    //seconds = Math.floor((distance % (1000 * 60)) / 1000);
                                    return [days, hours, minutes];

                                };

                                const serverInfoEmbed = {
                                    color: embedColour,
                                    title: 'WvW server info',
                                    description: `**Tier**: ${tier}\n**Server color**: ${colour}\n**Server name**: ${worldName}\n**Placement**: ${placement}\n**Time Left in MU**: ${editedEndTime[0]}d ${editedEndTime[1]}h ${editedEndTime[2]}m`,
                                    thumbnail: {
                                        url: "https://wiki.guildwars2.com/images/d/db/WvW_Instructor.png",
                                    },
                                    fields: [
                                        {
                                            name: '+========================================+\n' + 'Skirmish Info'.padStart(84, ' \u200B ') + '\n+========================================+',
                                            value: `**Skirmishes Played**: ${skirmishList.length} \u200B \u200B \u200B \u200B**Skirmishes Left**: ${84 - skirmishList.length}`
                                                + "```"
                                                + "\n V.P.  🥇First  🥈Second  🥉Last"
                                                + "\n-----------------------------------\n"
                                                + ` ${victoryPoints[colour.toLowerCase()]}`.padStart(3).padEnd(10) + `${first}`.padEnd(10) + `${second}`.padStart(2).padEnd(10) + `${last}`.padStart(2)
                                                + "\n```"
                                        },
                                        {
                                            name: '+========================================+\n' + 'Structure Info'.padStart(84, ' \u200B ') + '\n+========================================+',
                                            value: `**Current PPT**: ${currentPpt} \u200B \u200B \u200B \u200B**SM**: ${stoneMist}`
                                                + "```"
                                                + "\n  Map    Camps   Towers   Keeps"
                                                + "\n--------------------------------"
                                                + "\n  EB".padEnd(12) + `${structures[0][0]}`.padEnd(9) + `${structures[0][1]}`.padEnd(8) + `${structures[0][2]}`.padEnd(7)
                                                + "\n  Red".padEnd(12) + `${structures[1][0]}`.padEnd(9) + `${structures[1][1]}`.padEnd(8) + `${structures[1][2]}`.padEnd(3)
                                                + "\n  Blue".padEnd(12) + `${structures[2][0]}`.padEnd(9) + `${structures[2][1]}`.padEnd(8) + `${structures[2][2]}`.padEnd(3)
                                                + "\n  Green".padEnd(12) + `${structures[3][0]}`.padEnd(9) + `${structures[3][1]}`.padEnd(8) + `${structures[3][2]}`.padEnd(3)
                                                + "\n--------------------------------"
                                                + "\n  Total".padEnd(12) + `${structures[4][0]}`.padEnd(9) + `${structures[4][1]}`.padEnd(8) + `${structures[4][2]}`.padEnd(3)
                                                + "\n```"
                                            // +"\n=====================================================",
                                        },
                                        {
                                            name: '+========================================+\n' + 'Score Info'.padStart(84, ' \u200B ') + '\n+========================================+',
                                            value: `**Total Score**: ${json["scores"][colour.toLowerCase()]} \u200B \u200B \u200B \u200B**Current Skirmish Score**: ${json['skirmishes'][json['skirmishes'].length - 1]["scores"][colour.toLowerCase()]}`
                                                + "```"
                                                + "\n  EB     Blue     Red    Green"
                                                + "\n---------------------------------"
                                                + `\n${mapScores[0]}`.padEnd(10) + `${mapScores[3]}`.padEnd(8) + `${mapScores[2]}`.padEnd(8) + `${mapScores[1]}`.padEnd(6)
                                                + "\n```"
                                            // +"\n=====================================================",
                                        },
                                        {
                                            name: '+========================================+\n' + 'Kill/Death Info'.padStart(84, ' \u200B ') + '\n+========================================+',
                                            value: `**Total Kills**: ${json["kills"][colour.toLowerCase()]} \u200B \u200B \u200B \u200B**Total Deaths**: ${json["deaths"][colour.toLowerCase()]} \u200B \u200B \u200B \u200B**K/D ratio**: ${(json["kills"][colour.toLowerCase()] / json["deaths"][colour.toLowerCase()]).toFixed(2)}`
                                                + "```"
                                                + "\n  Map    Kills   Deaths    K/D"
                                                + "\n--------------------------------"
                                                + "\n  EB".padEnd(10) + `${kills[0]}`.padEnd(9) + `${deaths[0]}`.padEnd(9) + `${(kills[0] / deaths[0]).toFixed(2)}`.padEnd(3)
                                                + "\n  Red".padEnd(10) + `${kills[1]}`.padEnd(9) + `${deaths[1]}`.padEnd(9) + `${(kills[1] / deaths[1]).toFixed(2)}`.padEnd(3)
                                                + "\n  Blue".padEnd(10) + `${kills[2]}`.padEnd(9) + `${deaths[2]}`.padEnd(9) + `${(kills[2] / deaths[2]).toFixed(2)}`.padEnd(3)
                                                + "\n  Green".padEnd(10) + `${kills[3]}`.padEnd(9) + `${deaths[3]}`.padEnd(9) + `${(kills[3] / deaths[3]).toFixed(2)}`.padEnd(3)
                                                + "\n```"
                                            // +"\n=====================================================",
                                        }
                                    ],
                                    timestamp: new Date(),
                                    footer: {
                                        text: 'ok',
                                        icon_url: 'https://i.imgur.com/UUdiAwg.png',
                                    },
                                };

                                // return message.channel.send({ embeds: [serverInfoEmbed] })
                                interaction.reply({ embeds: [serverInfoEmbed] })
                            });
                    } else {
                        interaction.reply(`${worldName} is not a valid world!`)
                    }
                });
        } catch (error) {
            console.log(error);
        }
    },
};