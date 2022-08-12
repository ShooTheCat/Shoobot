const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
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
						.setDescription("URL of a song or palylist you want to play.")
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
				.setDescription("Skip the current song"))
		.addSubcommand(subcommand =>
			subcommand
				.setName("playing")
				.setDescription("Display the current song"))
		// .addSubcommand(subcommand =>
		// 	subcommand
		// 		.setName("queue")
		// 		.setDescription("Add a song to the queue"))
		// .addSubcommand(subcommand =>
		// 	subcommand
		// 		.setName("show_queue")
		// 		.setDescription("Show the queued songs"))
		// .addSubcommand(subcommand =>
		// 	subcommand
		// 		.setName("show_queue")
		// 		.setDescription("Show the queued songs"))
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

	// .setName("options")
	// .setDescription("Select an option")
	// .addStringOption(option =>
	// 	option
	// 		.setName('placeholder')
	// 		.setDescription("placeholder")
	// 		.setRequired(true)
	// 		.addChoices(
	// 			{ name: "queue", value: "queue" },
	// 			{ name: "pause", value: "pause" },
	// 			{ name: "resume", value: "resume" },
	// 			{ name: "skip", value: "skip" },
	// 			{ name: "stop", value: "stop" },
	// { name: "placeholder", value: "placeholder" },
	// ))),
	// .addSubcommand(subcommand => 
	// 		subcommand
	// 				.setName("placeholder")
	// 				.setDescription("placeholder")
	// 				.addStringOption(option => option.setName('placeholder').setDescription("placeholder").setRequired(true))),
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
					// if (!client.distube.toggleAutoplay(musicChannel)) {
					// 	await client.distube.toggleAutoplay(musicChannel);
					// };
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
                                    value: `**Choose an option from below**\n${
											searchResult.map((song, i) => `**${i + 1}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")
										}\n\n*Enter anything else or wait 60 seconds to cancel*`
                                })

					await interaction.editReply({ embeds: [searchEmbed] });
					// await interaction.editReply(`**Choose an option from below**\n${
					// 	searchResult.map((song, i) => `**${i + 1}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")
					// }\n\nPick the song you want to play\n*Enter anything else or wait 60 seconds to cancel*`);
					
					//Wait for user to pick the song
					const channel = interaction.channel;
					
					const filter = m => m.author.id === interaction.user.id;
					const collector = channel.createMessageCollector({ filter, max: 1, time: 60000 });
					collector.on('collect', async (msg) => {
						//Check is message is a number
						const queueNumber = parseInt(msg, 10);
						if ((!isNaN(queueNumber))) {
							await client.distube.play(musicChannel, searchResult[queueNumber-1],
								{
									member: interaction.member,
									textChannel: interaction.channel
								})
						} else {
							await channel.send("That's not a valid number");
						}
					});
					collector.on('end', async (collected, reason) => {
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

				// case "queue":
				// 	await interaction.editReply({ content: "sus" });
				// 	break;

				case "skip":
					await client.distube.skip(musicChannel);
					await interaction.editReply({ content: "Skipped to the next song" });
					break;

				case "playing":
					const currentSongs = await client.distube.getQueue(musicChannel);
					const currentSong = currentSongs.songs[0]

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

					await interaction.editReply({ embeds: [playingEmbed] });

					// await interaction.editReply({ content: `Currently playing: [${currentSong.name}](${currentSong.url}) - ${currentSong.formattedDuration}` });
					break;

				case "autoplay":
					const autoplayToggle = await client.distube.toggleAutoplay(musicChannel);
					await interaction.editReply({ content: `Set autoplay mode to: ${(autoplayToggle ? "On" : "Off")} ` });
					break;

				// case "show_queue":
				// 	// /* Need to limit how many chars are sent */
				// 	// // const queue = client.distube.getQueue(musicChannel);
				// 	// // interaction.editReply({ content: 'Current queue:\n' + queue.songs.map((song, id) =>
				// 	// // 	`**${id + 1}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``
				// 	// // ).join("\n")});
				// 	await interaction.editReply({ content: "sus" });
				// 	break;
				default:
					break;
			}
		} catch (error) {
			console.log(error);
		}


		// await interaction.editReply({
		//     content: "test"
		// });
	},
};