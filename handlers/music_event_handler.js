const { EmbedBuilder, Embed } = require("discord.js");
const { distube } = require("../shoobot");

module.exports = {
    async musicEventLoader(client) {
        // const queue = client.distube.queue;
        client.distube.removeAllListeners();

        client.distube
                    .on("playSong", (queue, song) => {
                        // queue.textChannel.send(`Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}`);
                        const playEmbed = new EmbedBuilder()
                            .setColor(10758886)
                            .setAuthor(
                                {
                                    name: client.user.username,
                                    iconURL: "https://static.staticwars.com/quaggans/coffee.jpg"
                                })
                            .setThumbnail("https://i.imgur.com/Z9uS2WK.gif")
                            .addFields( 
                                {
                                    name: "\u200B",
                                    value: `**Playing**: \`${song.name}\` \n**Duration**: \`${song.formattedDuration}\`\n**Requested by**: ${song.user}`
                                })
                            .addFields( 
                                {
                                    name: "\u200B",
                                    value: `Volume: \`${queue.volume}%\` | Loop: \`${ queue.repeatMode ? (queue.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Off' }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``
                                })
                        queue.textChannel.send({ embeds: [playEmbed] })
                    })
                    .on("addSong", (queue, song) => {
                        queue.textChannel.send(`Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}.`);
                    })
                    .on("addList", (queue, playlist) => {
                        queue.textChannel.send(`Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to the queue!`);
                    })
                    .on("error", (channel, error) => {
                        if (channel) {
                            channel.send(`An error encountered: ${error}`);
                            client.distube.voices.leave(channel);
                        } else {
                            console.error(error);
                        }
                    })
                    .on("noRelated", (queue) => {
                        queue.textChannel.send("No related songs found");
                    })
                    .on("initQueue", (queue) => {
                        queue.autoplay = true;
                    })
    },
};