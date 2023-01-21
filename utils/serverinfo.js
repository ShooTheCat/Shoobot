const { fetch } = require("undici");

module.exports = {
    async ServerInfo(servName) {
        try {
            const worldsInfo = await fetch('https://api.guildwars2.com/v2/worlds?ids=all');
            const worlds = await worldsInfo.json();

            const servId = GetServerId(servName);

            function GetServerId(servName) {
                for (let i = 0; i < worlds.length; i++) {
                    if (worlds[i].name === servName) {
                        return worlds[i].id;
                    };
                };
            };

            const matchurl = `https://api.guildwars2.com/v2/wvw/matches?world=${servId}`;
            const response = await fetch(matchurl);
            const sJson = await response.json();

            const sinfo = {
                endTime: new Date(sJson['end_time']).getTime() / 1000,
                skirmishes: sJson['skirmishes'],
                servColour: GetServColour(servId),
                server: function () {
                    return ServerInfo(this.servColour);
                },
            };

            function GetServColour(servId) {
                const worldIds = Object.values(sJson['all_worlds']);

                for (let i = 0; i < worldIds.length; i++) {
                    if (worldIds[i].includes(servId)) {
                        const colour = Object.keys(sJson['all_worlds']).find(key => sJson['all_worlds'][key] === worldIds[i]);
                        return colour;
                    };
                };
            };

            function ServerInfo(colour) {
                const serverInfo = {
                    totalScore: sJson['scores'][colour],
                    curScore: sJson['skirmishes'][sJson['skirmishes'].length - 1]['scores'][colour],
                    mainWorld: GetWorldName(sJson['all_worlds'][colour][0]),
                    linkedWorld: GetWorldName(sJson['all_worlds'][colour][1]) ?? "",
                    worlds: function () {
                        return `**Main**: ${this.mainWorld}\n**Link**: ${this.linkedWorld}`;
                    },
                    kills: sJson['kills'][colour],
                    deaths: sJson['deaths'][colour],
                    kdratio: function () {
                        return (this.kills / this.deaths).toFixed(2);
                    },
                    victoryPoints: sJson['victory_points'][colour],
                    skirmPlacements: GetSkirmishStandings(colour),
                    placement: GetPlacement(colour),
                    eternalBorder: GetMapInfo(0, colour),
                    redBorder: GetMapInfo(1, colour),
                    blueBorder: GetMapInfo(2, colour),
                    greenBorder: GetMapInfo(3, colour),
                    camps: function () {
                        return this.eternalBorder.camps[0] + this.redBorder.camps[0] + this.blueBorder.camps[0] + this.greenBorder.camps[0]
                    },
                    towers: function () {
                        return this.eternalBorder.towers[0] + this.redBorder.towers[0] + this.blueBorder.towers[0] + this.greenBorder.towers[0]
                    },
                    keeps: function () {
                        return this.eternalBorder.keeps[0] + this.redBorder.keeps[0] + this.blueBorder.keeps[0] + this.greenBorder.keeps[0]
                    },
                    curPPT: function () {
                        return this.eternalBorder.ppt() + this.redBorder.ppt() + this.blueBorder.ppt() + this.greenBorder.ppt()
                    },
                };

                function GetWorldName(servId) {
                    const populations = {
                        Medium: "Medium 💎500",
                        High: "High 💎1000",
                        VeryHigh: "V. High 💎1800",
                        Full: "Full"
                    }
                    for (let i = 0; i < worlds.length; i++) {
                        if (worlds[i]['id'] === servId) {
                            return `${worlds[i]['name']} (${populations[worlds[i]['population']]})`;
                        }
                    }
                };

                return serverInfo;
            };

            function GetMapInfo(map, colour) {
                const mapInfo = {
                    score: sJson['maps'][map]['scores'][colour],
                    kills: sJson['maps'][map]['kills'][colour],
                    deaths: sJson['maps'][map]['deaths'][colour],
                    kdratio: function () {
                        return (this.kills / this.deaths).toFixed(2);
                    },
                    camps: GetObjects('Camp', colour),
                    towers: GetObjects('Tower', colour),
                    keeps: GetObjects('Keep', colour),
                    stoneMist: (map === 0) ? GetObjects('Castle', colour) : [0, 0],
                    ppt: function () {
                        return this.camps[1] + this.towers[1] + this.keeps[1] + this.stoneMist[1]
                    }
                };

                function GetObjects(objtype, colour) {
                    let objcount = 0;
                    let ppt = 0;

                    if (objtype == 'Castle') {
                        if (sJson['maps'][0]['objectives'][3]['owner'].toLowerCase() == colour) {
                            objcount++;
                            ppt += sJson['maps'][0]['objectives'][3]['points_tick'];
                            return [objcount, ppt];
                        };
                    }

                    for (const object of sJson['maps'][map]['objectives']) {
                        if (object['type'] == objtype && object['owner'].toLowerCase() == colour) {
                            objcount++;
                            ppt += object['points_tick'];
                        };
                    };
                    return [objcount, ppt];
                };
                return mapInfo;
            };

            function GetPlacement(colour) {
                const victorypoints = sJson['victory_points'];
                if (victorypoints[colour] == Math.max(...Object.values(victorypoints))) {
                    return '🥇 1';
                } else if (victorypoints[colour] == Math.min(...Object.values(victorypoints))) {
                    return '🥉 3';
                } else {
                    return '🥈 2';
                };
            };

            function GetSkirmishStandings(colour) {
                let first = 0;
                let second = 0;
                let last = 0;

                const skirms = sJson['skirmishes'].slice(0, -1);

                for (let i = 0; i < skirms.length; i++) {
                    const min = Math.min(...Object.values(skirms[i]['scores']));
                    const max = Math.max(...Object.values(skirms[i]['scores']));

                    if (skirms[i]['scores'][colour] === min) last++;
                    if (skirms[i]['scores'][colour] === max) first++;
                    if (skirms[i]['scores'][colour] != min && skirms[i]['scores'][colour] != max) second++;

                };
            };

            const serverInfoEmbed = {
                color: 16777215,
                title: 'WvW Server Info',
                description: `**Region**: ${(region == 2) ? 'Europe 🇪🇺' : 'North America 🇺🇸'}\n**Tier**: ${tierId}\n**Skirmishes Played**: ${sinfo['skirmishes'].length}\n**Skirmishes Left**: ${84 - sinfo['skirmishes'].length}\n**Next Reset**: <t:${sinfo['endTime']}:R>`,
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
                        name: 'General Info',
                        value:
                            "```"
                            + "\n  ⠀ ⠀   EBG     Red     Blue   Green    Total"
                            + "\n----------------------------------------------"
                            + "\nScore".padEnd(8) + `${sinfo[server]['eternalBorder']['score']}`.padEnd(8) + `${sinfo[server]['redBorder']['score']}`.padEnd(8) + `${sinfo[server]['blueBorder']['score']}`.padEnd(8) + `${sinfo[server]['greenBorder']['score']}`.padEnd(8) + `${sinfo[server]['totalScore']}`
                            + "\nKills".padEnd(8) + `${sinfo[server]['eternalBorder']['kills']}`.padEnd(8) + `${sinfo[server]['redBorder']['kills']}`.padEnd(8) + `${sinfo[server]['blueBorder']['kills']}`.padEnd(8) + `${sinfo[server]['greenBorder']['kills']}`.padEnd(8) + `${sinfo[server]['kills']}`
                            + "\nDeaths".padEnd(8) + `${sinfo[server]['eternalBorder']['deaths']}`.padEnd(8) + `${sinfo[server]['redBorder']['deaths']}`.padEnd(8) + `${sinfo[server]['blueBorder']['deaths']}`.padEnd(8) + `${sinfo[server]['greenBorder']['deaths']}`.padEnd(8) + `${sinfo[server]['deaths']}`
                            + "\nK/D".padEnd(8) + `${sinfo[server]['eternalBorder'].kdratio()}`.padEnd(8) + `${sinfo[server]['redBorder'].kdratio()}`.padEnd(8) + `${sinfo[server]['blueBorder'].kdratio()}`.padEnd(8) + `${sinfo[server]['greenBorder'].kdratio()}`.padEnd(8) + `${sinfo[server].kdratio()}`
                            + "\nCamps".padEnd(8) + `${sinfo[server]['eternalBorder']['camps'][0]}`.padEnd(8) + `${sinfo[server]['redBorder']['camps'][0]}`.padEnd(8) + `${sinfo[server]['blueBorder']['camps'][0]}`.padEnd(8) + `${sinfo[server]['greenBorder']['camps'][0]}`.padEnd(8) + `${sinfo[server].camps()}`
                            + "\nTowers".padEnd(8) + `${sinfo[server]['eternalBorder']['towers'][0]}`.padEnd(8) + `${sinfo[server]['redBorder']['towers'][0]}`.padEnd(8) + `${sinfo[server]['blueBorder']['towers'][0]}`.padEnd(8) + `${sinfo[server]['greenBorder']['towers'][0]}`.padEnd(8) + `${sinfo[server].towers()}`
                            + "\nKeeps".padEnd(8) + `${sinfo[server]['eternalBorder']['keeps'][0]}`.padEnd(8) + `${sinfo[server]['redBorder']['keeps'][0]}`.padEnd(8) + `${sinfo[server]['blueBorder']['keeps'][0]}`.padEnd(8) + `${sinfo[server]['greenBorder']['keeps'][0]}`.padEnd(8) + `${sinfo[server].keeps()}`
                            + "\nPPT".padEnd(8) + `${sinfo[server]['eternalBorder'].ppt()}`.padEnd(8) + `${sinfo[server]['redBorder'].ppt()}`.padEnd(8) + `${sinfo[server]['blueBorder'].ppt()}`.padEnd(8) + `${sinfo[server]['greenBorder'].ppt()}`.padEnd(8) + `${sinfo[server].curPPT()}`
                            + "\n```"
                    }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: 'https://i.imgur.com/UUdiAwg.png',
                },
            };

            const embeds = [serverInfoEmbed];

            function MakeEmbed(server) {
                const embedOptions = () => {
                    if (server == 'redServ') {
                        return [12454410, "https://wiki.guildwars2.com/images/4/40/Commander_tag_%28red%29.png"];
                    } else if (server == 'blueServ') {
                        return [2197732, "https://wiki.guildwars2.com/images/5/54/Commander_tag_%28blue%29.png"]
                    } else {
                        return [184871, "https://wiki.guildwars2.com/images/5/5e/Commander_tag_%28green%29.png"]
                    }
                }
                const serverEmbed = {
                    color: embedOptions()[0],
                    title: `${sinfo[server]['mainWorld']}`,
                    description: `**Victory Points**: ${sinfo[server]['victoryPoints']}⠀**PPT**: ${sinfo[server].curPPT()}⠀**Current Score**: ${sinfo[server]['curScore']}\n**K/D**: ${sinfo[server].kdratio()}⠀**Kills**: ${sinfo[server]['kills']}⠀**Deaths**: ${sinfo[server]['deaths']}\n**SM**: ${(sinfo[server]['eternalBorder']['stoneMist'][0] == 1) ? "✅" : "❌"}`,
                    thumbnail: {
                        url: embedOptions()[1],
                    },
                    fields: [
                        {
                            name: 'General Info',
                            value:
                                "```"
                                + "\n  ⠀ ⠀   EBG     Red     Blue   Green    Total"
                                + "\n----------------------------------------------"
                                + "\nScore".padEnd(8) + `${sinfo[server]['eternalBorder']['score']}`.padEnd(8) + `${sinfo[server]['redBorder']['score']}`.padEnd(8) + `${sinfo[server]['blueBorder']['score']}`.padEnd(8) + `${sinfo[server]['greenBorder']['score']}`.padEnd(8) + `${sinfo[server]['totalScore']}`
                                + "\nKills".padEnd(8) + `${sinfo[server]['eternalBorder']['kills']}`.padEnd(8) + `${sinfo[server]['redBorder']['kills']}`.padEnd(8) + `${sinfo[server]['blueBorder']['kills']}`.padEnd(8) + `${sinfo[server]['greenBorder']['kills']}`.padEnd(8) + `${sinfo[server]['kills']}`
                                + "\nDeaths".padEnd(8) + `${sinfo[server]['eternalBorder']['deaths']}`.padEnd(8) + `${sinfo[server]['redBorder']['deaths']}`.padEnd(8) + `${sinfo[server]['blueBorder']['deaths']}`.padEnd(8) + `${sinfo[server]['greenBorder']['deaths']}`.padEnd(8) + `${sinfo[server]['deaths']}`
                                + "\nK/D".padEnd(8) + `${sinfo[server]['eternalBorder'].kdratio()}`.padEnd(8) + `${sinfo[server]['redBorder'].kdratio()}`.padEnd(8) + `${sinfo[server]['blueBorder'].kdratio()}`.padEnd(8) + `${sinfo[server]['greenBorder'].kdratio()}`.padEnd(8) + `${sinfo[server].kdratio()}`
                                + "\nCamps".padEnd(8) + `${sinfo[server]['eternalBorder']['camps'][0]}`.padEnd(8) + `${sinfo[server]['redBorder']['camps'][0]}`.padEnd(8) + `${sinfo[server]['blueBorder']['camps'][0]}`.padEnd(8) + `${sinfo[server]['greenBorder']['camps'][0]}`.padEnd(8) + `${sinfo[server].camps()}`
                                + "\nTowers".padEnd(8) + `${sinfo[server]['eternalBorder']['towers'][0]}`.padEnd(8) + `${sinfo[server]['redBorder']['towers'][0]}`.padEnd(8) + `${sinfo[server]['blueBorder']['towers'][0]}`.padEnd(8) + `${sinfo[server]['greenBorder']['towers'][0]}`.padEnd(8) + `${sinfo[server].towers()}`
                                + "\nKeeps".padEnd(8) + `${sinfo[server]['eternalBorder']['keeps'][0]}`.padEnd(8) + `${sinfo[server]['redBorder']['keeps'][0]}`.padEnd(8) + `${sinfo[server]['blueBorder']['keeps'][0]}`.padEnd(8) + `${sinfo[server]['greenBorder']['keeps'][0]}`.padEnd(8) + `${sinfo[server].keeps()}`
                                + "\nPPT".padEnd(8) + `${sinfo[server]['eternalBorder'].ppt()}`.padEnd(8) + `${sinfo[server]['redBorder'].ppt()}`.padEnd(8) + `${sinfo[server]['blueBorder'].ppt()}`.padEnd(8) + `${sinfo[server]['greenBorder'].ppt()}`.padEnd(8) + `${sinfo[server].curPPT()}`
                                + "\n```"
                        }
                    ],
                    timestamp: new Date(),
                    footer: {
                        icon_url: 'https://i.imgur.com/UUdiAwg.png',
                    },
                }
                embeds.push(serverEmbed);
            };

            ['redServ', 'blueServ', 'greenServ'].forEach(MakeEmbed);

            return embeds;
        } catch (error) {
            console.log(error)
        }



    }
}