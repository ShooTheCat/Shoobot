const { fetch } = require("undici");

module.exports = {
    async TierInfo(region, tierId) {
        try {
            const worldsInfo = await fetch('https://api.guildwars2.com/v2/worlds?ids=all');
            const worlds = await worldsInfo.json();
            
            const matchurl = `https://api.guildwars2.com/v2/wvw/matches/${region}-${tierId}`;
            const response = await fetch(matchurl);
            const tJson = await response.json();
            
            const tinfo = {
                endTime: new Date(tJson['end_time']).getTime() / 1000,
                skirmishes: tJson['skirmishes'],
                redServ: ServerInfo('red'),
                blueServ: ServerInfo('blue'),
                greenServ: ServerInfo('green')
            };

            function ServerInfo(colour) {
                const serverInfo = {
                    totalScore: tJson['scores'][colour],
                    curScore: tJson['skirmishes'][tJson['skirmishes'].length - 1]['scores'][colour],
                    mainWorld: GetWorldName(tJson['all_worlds'][colour][0]),
                    linkedWorld: GetWorldName(tJson['all_worlds'][colour][1]) ?? "",
                    worlds: function () {
                        return `**Main**: ${this.mainWorld}\n**Link**: ${this.linkedWorld}`;
                    },
                    kills: tJson['kills'][colour],
                    deaths: tJson['deaths'][colour],
                    kdratio: function () {
                        return (this.kills / this.deaths).toFixed(2);
                    },
                    victoryPoints: tJson['victory_points'][colour],
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

                function GetWorldName(worldId) {
                    const populations = {
                        Medium: "Medium 💎500",
                        High: "High 💎1000",
                        VeryHigh: "V. High 💎1800",
                        Full: "Full"
                    }
                    for (let i = 0; i < worlds.length; i++) {
                        if (worlds[i]['id'] === worldId) {
                            return `${worlds[i]['name']} (${populations[worlds[i]['population']]})`;
                        }
                    }
                };

                return serverInfo;
            };

            function GetMapInfo(map, colour) {
                const mapInfo = {
                    score: tJson['maps'][map]['scores'][colour],
                    kills: tJson['maps'][map]['kills'][colour],
                    deaths: tJson['maps'][map]['deaths'][colour],
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
                        if (tJson['maps'][0]['objectives'][3]['owner'].toLowerCase() == colour) {
                            objcount++;
                            ppt += tJson['maps'][0]['objectives'][3]['points_tick'];
                            return [objcount, ppt];
                        };
                    }

                    for (const object of tJson['maps'][map]['objectives']) {
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
                const victorypoints = tJson['victory_points'];
                if (victorypoints[colour] == Math.max(...Object.values(victorypoints))) {
                    return '🥇';
                } else if (victorypoints[colour] == Math.min(...Object.values(victorypoints))) {
                    return '🥉';
                } else {
                    return '🥈';
                };
            };

            const serverInfoEmbed = {
                color: 16777215,
                title: 'WvW Tier Info',
                description: `**Region**: ${(region == 2) ? 'Europe 🇪🇺' : 'North America 🇺🇸'}\n**Tier**: ${tierId}\n**Skirmishes Played**: ${tinfo['skirmishes'].length}\n**Skirmishes Left**: ${84 - tinfo['skirmishes'].length}\n**Next Reset**: <t:${tinfo['endTime']}:R>`,
                thumbnail: {
                    url: "https://wiki.guildwars2.com/images/d/db/WvW_Instructor.png",
                },
                fields: [
                    {
                        name: `🟥 Red Server(s) ${tinfo['redServ']['placement']}`,
                        value: tinfo['redServ'].worlds(),
                        inline: true
                    },
                    {
                        name: `🟦 Blue Server(s) ${tinfo['blueServ']['placement']}`,
                        value: tinfo['blueServ'].worlds(),
                        inline: true
                    },
                    {
                        name: `🟩 Green Server(s) ${tinfo['greenServ']['placement']}`,
                        value: tinfo['greenServ'].worlds(),
                        inline: true
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
                    title: `${tinfo[server]['mainWorld']}`, 
                    description: `**Victory Points**: ${tinfo[server]['victoryPoints']}⠀**PPT**: ${tinfo[server].curPPT()}⠀**Current Score**: ${tinfo[server]['curScore']}\n**K/D**: ${tinfo[server].kdratio()}⠀**Kills**: ${tinfo[server]['kills']}⠀**Deaths**: ${tinfo[server]['deaths']}\n**SM**: ${(tinfo[server]['eternalBorder']['stoneMist'][0] == 1) ? "✅" : "❌"}`,
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
                                + "\nScore".padEnd(8) + `${tinfo[server]['eternalBorder']['score']}`.padEnd(8) + `${tinfo[server]['redBorder']['score']}`.padEnd(8) + `${tinfo[server]['blueBorder']['score']}`.padEnd(8) + `${tinfo[server]['greenBorder']['score']}`.padEnd(8) + `${tinfo[server]['totalScore']}`
                                + "\nKills".padEnd(8) + `${tinfo[server]['eternalBorder']['kills']}`.padEnd(8) + `${tinfo[server]['redBorder']['kills']}`.padEnd(8) + `${tinfo[server]['blueBorder']['kills']}`.padEnd(8) + `${tinfo[server]['greenBorder']['kills']}`.padEnd(8) + `${tinfo[server]['kills']}`
                                + "\nDeaths".padEnd(8) + `${tinfo[server]['eternalBorder']['deaths']}`.padEnd(8) + `${tinfo[server]['redBorder']['deaths']}`.padEnd(8) + `${tinfo[server]['blueBorder']['deaths']}`.padEnd(8) + `${tinfo[server]['greenBorder']['deaths']}`.padEnd(8) + `${tinfo[server]['deaths']}`
                                + "\nK/D".padEnd(8) + `${tinfo[server]['eternalBorder'].kdratio()}`.padEnd(8) + `${tinfo[server]['redBorder'].kdratio()}`.padEnd(8) + `${tinfo[server]['blueBorder'].kdratio()}`.padEnd(8) + `${tinfo[server]['greenBorder'].kdratio()}`.padEnd(8) + `${tinfo[server].kdratio()}`
                                + "\nCamps".padEnd(8) + `${tinfo[server]['eternalBorder']['camps'][0]}`.padEnd(8) + `${tinfo[server]['redBorder']['camps'][0]}`.padEnd(8) + `${tinfo[server]['blueBorder']['camps'][0]}`.padEnd(8) + `${tinfo[server]['greenBorder']['camps'][0]}`.padEnd(8) + `${tinfo[server].camps()}`
                                + "\nTowers".padEnd(8) + `${tinfo[server]['eternalBorder']['towers'][0]}`.padEnd(8) + `${tinfo[server]['redBorder']['towers'][0]}`.padEnd(8) + `${tinfo[server]['blueBorder']['towers'][0]}`.padEnd(8) + `${tinfo[server]['greenBorder']['towers'][0]}`.padEnd(8) + `${tinfo[server].towers()}`
                                + "\nKeeps".padEnd(8) + `${tinfo[server]['eternalBorder']['keeps'][0]}`.padEnd(8) + `${tinfo[server]['redBorder']['keeps'][0]}`.padEnd(8) + `${tinfo[server]['blueBorder']['keeps'][0]}`.padEnd(8) + `${tinfo[server]['greenBorder']['keeps'][0]}`.padEnd(8) + `${tinfo[server].keeps()}`
                                + "\nPPT".padEnd(8) + `${tinfo[server]['eternalBorder'].ppt()}`.padEnd(8) + `${tinfo[server]['redBorder'].ppt()}`.padEnd(8) + `${tinfo[server]['blueBorder'].ppt()}`.padEnd(8) + `${tinfo[server]['greenBorder'].ppt()}`.padEnd(8) + `${tinfo[server].curPPT()}`
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