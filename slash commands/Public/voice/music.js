const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ComponentType } = require("discord.js");
const client = require("../../../shoobot");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("music")
		.setDescription("Weeb music only!")
		.addSubcommand(subcommand =>
			subcommand
				.setName("play")
				.setDescription("Play a song")
				.addStringOption(option =>
					option
						.setName('song')
						.setDescription("URL of a song or playlist you want to play.")
						.setRequired(true))
				.addBooleanOption(option =>
					option
						.setName('shuffle')
						.setDescription("Shuffle in case of playlist")
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName("search")
				.setDescription("Play a song")
				.addStringOption(option =>
					option
						.setName('title')
						.setDescription("Name of the song you want to search for.")
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName("volume")
				.setDescription("Adjust the volume")
				.addIntegerOption(option =>
					option
						.setName('percent')
						.setDescription("Set the volume percentage (10=10%,20=20%,etc)")
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName("pause")
				.setDescription("Pause the current song"))
		.addSubcommand(subcommand =>
			subcommand
				.setName("resume")
				.setDescription("Resume the paused song"))
		.addSubcommand(subcommand =>
			subcommand
				.setName("stop")
				.setDescription("Stop the current song"))
		.addSubcommand(subcommand =>
			subcommand
				.setName("shuffle")
				.setDescription("Shuffle the playlist"))
		.addSubcommand(subcommand =>
			subcommand
				.setName("skip")
				.setDescription("Skip the current song")
				.addIntegerOption(option =>
					option
						.setName('to')
						.setDescription("Number in queue to skip to")
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName("seek")
				.setDescription("Skip to the given time in the current song")
				.addIntegerOption(option =>
					option
						.setName('hours')
						.setDescription("Hour to skip to")
						.setRequired(false))
				.addIntegerOption(option =>
					option
						.setName('minutes')
						.setDescription("Minute to skip to")
						.setRequired(false))
				.addIntegerOption(option =>
					option
						.setName('seconds')
						.setDescription("Second to skip to")
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName("playing")
				.setDescription("Display the current song"))
		.addSubcommand(subcommand =>
			subcommand
				.setName("queue")
				.setDescription("Show the queued songs"))
		.addSubcommand(subcommand =>
			subcommand
				.setName("autoplay")
				.setDescription("Turn autoplay on/off"))
		.addSubcommand(subcommand =>
			subcommand
				.setName("loop")
				.setDescription("Loop the current song")
				.addIntegerOption(option =>
					option
						.setName('mode')
						.setDescription("Set the loop mode ( 0=DISABLED, 1=SONG, 2=QUEUE )")
						.setRequired(false))),
	/**
	 * @param {Client} client
	 */
	async execute(interaction) {
		await interaction.deferReply();
		// const client = interaction.client;
		const musicChannel = interaction.member.voice.channel;

		if (!musicChannel) return interaction.editReply({ content: "You must be in a voice channel!" + "\n[](https://i.imgur.com/hnckcyg.png)" });

		try {
			const instruction = interaction.options.getSubcommand();
			switch (instruction) {
				case "play":
					const song = interaction.options.getString("song");
					const shuffleToggle = interaction.options.getBoolean("shuffle");

					await client.distube.play(musicChannel, song,
						{
							member: interaction.member,
							textChannel: interaction.channel
						})

					if (shuffleToggle) {
						await client.distube.shuffle(musicChannel);
					}

					await interaction.editReply({ content: "\u200B" });
					break;

				case "search":
					//Get search results
					const title = interaction.options.getString("title");
					const searchResult = await client.distube.search(title)
					//Display search results
					const searchEmbed = new EmbedBuilder()
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
								value: `**Choose an option from below**\n${searchResult.map((song, i) => `**${i + 1}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")
									}\n\n*Enter anything else or wait 60 seconds to cancel*`
							})

					await interaction.editReply({ embeds: [searchEmbed] });
					// await interaction.editReply(`**Choose an option from below**\n${
					// 	searchResult.map((song, i) => `**${i + 1}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")
					// }\n\nPick the song you want to play\n*Enter anything else or wait 60 seconds to cancel*`);

					//Wait for user to pick the song
					const channel = interaction.channel;

					const filter = m => m.author.id === interaction.user.id;
					const searchCollector = channel.createMessageCollector({ filter, max: 1, time: 60000 });
					searchCollector.on('collect', async (msg) => {
						//Check is message is a number
						const queueNumber = parseInt(msg, 10);
						if ((!isNaN(queueNumber))) {
							await client.distube.play(musicChannel, searchResult[queueNumber - 1],
								{
									member: interaction.member,
									textChannel: interaction.channel
								})
						} else {
							await channel.send("That's not a valid number");
						}
					});
					searchCollector.on('end', async (collected, reason) => {
						// only send a message when the "end" event fires because of timeout
						if (reason === 'time') {
							await channel.send("No song was selected in 60 seconds.");
						}
					})
					break;

				case "volume":
					const volume = interaction.options.getInteger("percent");
					if ((volume < 1) || (volume > 100)) {
						await interaction.editReply({ content: "Volume needs to be between 1 and 100" });
					} else {
						client.distube.setVolume(musicChannel, volume);
						await interaction.editReply({ content: `Volume set to ${volume}%` });
					}
					break;

				case "pause":
					await client.distube.pause(musicChannel);
					await interaction.editReply({ content: "Paused the song" });
					break;

				case "resume":
					await client.distube.resume(musicChannel);
					// await eventLoader(interaction.client)
					await interaction.editReply({ content: "Resumed playing the song" });
					break;

				case "stop":
					await client.distube.stop(musicChannel);
					// await eventLoader(interaction.client)
					await interaction.editReply({ content: "Stopped the music and cleared the queue." });
					break;

				case "shuffle":
					await client.distube.shuffle(musicChannel);
					await interaction.editReply({ content: "Queue/playlist shuffled" });
					break;

				case "loop":
					const mode = interaction.options.getInteger("mode");
					const loopMode = client.distube.setRepeatMode(musicChannel, mode);
					switch (loopMode) {
						case RepeatMode.DISABLED:
							await interaction.editReply({ content: "Looping Off" });
							break;

						case RepeatMode.SONG:
							await interaction.editReply({ content: "Looping current song" });
							break;

						case RepeatMode.QUEUE:
							await interaction.editReply({ content: "Looping queue" });
							break;

						default:
							break;
					}
					break;

				case "queue":
					const currentQueue = currentSongs;
					// await interaction.editReply({ content: 'Current queue:\n' + queue.songs.map((song, id) =>
					// 	`**${id + 1}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``
					// ).join("\n")});
					const mappedQueue = currentQueue.songs.map((song, id) => [`💜` + `\u1CBC` + `**${(id + 1)}**.` + ` \u200B [${song.name}](${song.url}) - \`${song.formattedDuration}\``]);
					const queueArray = Array.from(mappedQueue);
					const image = null;
					const forward = new ButtonBuilder()
						.setCustomId("forward")
						.setLabel("▶")
						.setStyle(ButtonStyle.Success)

					const back = new ButtonBuilder()
						.setCustomId("back")
						.setLabel("◀")
						.setStyle(ButtonStyle.Secondary)

					function chunkArray(myArray, chunk_size) {
						const results = [];

						while (myArray.length) {
							const chunk = myArray.splice(0, chunk_size);
							const chunkString = chunk.join("\n");
							const embed = new EmbedBuilder()
								.setDescription(
									chunkString + "\n\n" +
									"·.★·.·´¯·.·★ /ᐠ｡ꞈ｡ᐟ\\\\★·.·´¯·.·★.·\n━━━  Have an ok day  ━━━")
								.setColor(10758886)
								.setImage("https://cdn.discordapp.com/attachments/682468880676815036/1008118796688572447/purple.gif");
							results.push(embed);
						}

						return results;
					}

					const result = chunkArray(queueArray, 15);
					const embedArrayLen = result.length;
					const canFitToOneEmbed = embedArrayLen <= 1;
					let currentPage = 0;

					const sendEmbed = await interaction.editReply({
						content: "╔════════ılılıll|llılıl════════╗\n"
			       			   + "**Playlist Queue**\n".padStart(50, ' \u200B ')
			      			   + "╚════♫♪.ılılıll|̲̅̅●̲̅̅|̲̅̅=̲̅̅|̲̅̅●̲̅̅|llılılı.♫♪════╝",
						embeds: [result[0].setFooter({text: `Page ${currentPage + 1}/${embedArrayLen}`})],
						components: [new ActionRowBuilder().addComponents(back.setDisabled(true), forward)]
					});

					if (canFitToOneEmbed) return;

					const queueCollector = sendEmbed.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300000 });

					queueCollector.on('collect', async (i) => {
						if (i.user.id === interaction.user.id) {
							if ((i.customId === "forward") && (currentPage <= embedArrayLen)) {
								currentPage++;

								if ((currentPage + 1) === embedArrayLen) {
									return i.update({
										embeds: [result[currentPage].setFooter({text: `Page ${currentPage + 1}/${embedArrayLen}`})],
										components: [
											new ActionRowBuilder().addComponents(
												back.setDisabled(false).setStyle(ButtonStyle.Success),
												forward.setDisabled(true).setStyle(ButtonStyle.Secondary)
											)]
									});
								} else {
									return i.update({
										embeds: [result[currentPage].setFooter({text: `Page ${currentPage + 1}/${embedArrayLen}`})],
										components: [
											new ActionRowBuilder().addComponents(
												back.setDisabled(false).setStyle(ButtonStyle.Success),
												forward.setDisabled(false).setStyle(ButtonStyle.Success)
											)]
									});
								}
							} else if ((i.customId === "back") && (currentPage >= 0)) {
								currentPage--;

								if ((currentPage) === 0) {
									return i.update({
										embeds: [result[currentPage].setFooter({text: `Page ${currentPage + 1}/${embedArrayLen}`})],
										components: [
											new ActionRowBuilder().addComponents(
												back.setDisabled(true).setStyle(ButtonStyle.Secondary),
												forward.setDisabled(false).setStyle(ButtonStyle.Success)
											)]
									});
								} else {
									return i.update({
										embeds: [result[currentPage].setFooter({text: `Page ${currentPage + 1}/${embedArrayLen}`})],
										components: [
											new ActionRowBuilder().addComponents(
												back.setDisabled(false).setStyle(ButtonStyle.Success),
												forward.setDisabled(false).setStyle(ButtonStyle.Success)
											)]
									});
								}
							}
							// i.reply(`${i.user.id} clicked on the ${i.customId} button.`);
						} else {
							i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
						}
					});

					queueCollector.on('end', collected => {
						return
					});

					break;

				case "skip":
					const queueNumber = interaction.options.getInteger("to");

					if (!queueNumber) {
						await client.distube.skip(musicChannel);
						await interaction.editReply({ content: "Skipped to the next song" });
					} else {
						await client.distube.jump(musicChannel, queueNumber-1)
									.catch(err => interaction.editReply("Invalid song number."));
						await interaction.editReply({ content: `Skipped to song #${queueNumber}` });
					}
					break;
				
				case "seek":
					const currSongs = await client.distube.getQueue(musicChannel);
					const currSong = currSongs.songs[0];

					const hours = interaction.options.getInteger("hours");
					const minutes = interaction.options.getInteger("minutes");
					const seconds = interaction.options.getInteger("seconds");

					function toSeconds(hours = 0, minutes = 0, seconds = 0) {
						const hourToSec = hours * 60 * 60;
						const minToSec = minutes * 60;
						const secondsToSkipTo = hourToSec + minToSec + seconds;

						return secondsToSkipTo;
					}

					const timeToSkipTo = toSeconds(hours, minutes, seconds);
					const currentSongDuration = currSong.duration;

					if ( (timeToSkipTo >= 0) && (timeToSkipTo <= currentSongDuration) ) {
						await client.distube.seek(musicChannel, timeToSkipTo);

						const seekEmbed = new EmbedBuilder()
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
									value: `**Currently Playing**: [${currSong.name}](${currSong.url}) \n**Duration**: \`${currSongs.formattedCurrentTime}/${currSong.formattedDuration}\`\n**Requested by**: ${currSong.user}`
								})
							.addFields( 
                                {
                                    name: "\u200B",
                                    value: `Volume: \`${currSongs.volume}%\` | Loop: \`${ currSongs.repeatMode ? (currSongs.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Off' }\` | Autoplay: \`${currSongs.autoplay ? 'On' : 'Off'}\``
                                })

						await interaction.editReply({ embeds: [seekEmbed] });
					} else {
						await interaction.editReply({ content: `Given time needs to be between 0 and ${currentSong.formattedDuration}`})
					}

					break;

				case "playing":
					const currentSongs = await client.distube.getQueue(musicChannel);
					const currentSong = currentSongs.songs[0];

					const playingEmbed = new EmbedBuilder()
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
								value: `**Currently Playing**: [${currentSong.name}](${currentSong.url}) \n**Duration**: \`${currentSongs.formattedCurrentTime}/${currentSong.formattedDuration}\`\n**Requested by**: ${currentSong.user}`
							})
						.addFields( 
							{
								name: "\u200B",
								value: `Volume: \`${currentSongs.volume}%\` | Loop: \`${ currentSongs.repeatMode ? (currentSongs.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Off' }\` | Autoplay: \`${currentSongs.autoplay ? 'On' : 'Off'}\``
							})

					await interaction.editReply({ embeds: [playingEmbed] });

					// await interaction.editReply({ content: `Currently playing: [${currentSong.name}](${currentSong.url}) - ${currentSong.formattedDuration}` });
					break;

				case "autoplay":
					const autoplayToggle = await client.distube.toggleAutoplay(musicChannel);
					await interaction.editReply({ content: `Set autoplay mode to: ${(autoplayToggle ? "On" : "Off")} ` });
					break;

				default:
					break;
			}
		} catch (error) {
			console.log(error);
		}
	},
};