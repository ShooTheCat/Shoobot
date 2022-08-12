const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("hello")
		.setDescription("Says hello"),
	async execute(interaction) {
		// const array = [...Array(20).keys()];
		// const current = array.slice(start, start + 10);
		const testEmbed = new EmbedBuilder()
				.setDescription(
					`
					1. Hanatan - Senbonzakura (Suzumu Remix) - 04:11
					2. Hanatan - Romeo and Cinderella - 04:39
					3. Hanatan - Tengaku - 04:36
					4. 【1 Hour】YURiCa/Hanatan [花たん] Best Songs Playlist - Emotional Voice - 01:08:38
					5. Hanatan - Ghost Rule - 03:28
					6. KikuoHana - ヒトガワリ - 04:25
					7. Hanatan - Niwaka Ame - 05:46
					8. Hanatan - WAVE - 03:16
					9. 【ぽこた】サンドリヨン（Cendrillon）10th Anniversary　歌ってみた【花たん】 - 04:42
					10. Hanatan - Tell Your World - 04:19	
					1. Hanatan - Senbonzakura (Suzumu Remix) - 04:11
					2. Hanatan - Romeo and Cinderella - 04:39
					3. Hanatan - Tengaku - 04:36
					4. 【1 Hour】YURiCa/Hanatan [花たん] Best Songs Playlist - Emotional Voice - 01:08:38
					5. Hanatan - Ghost Rule - 03:28
					6. KikuoHana - ヒトガワリ - 04:25
					7. Hanatan - Niwaka Ame - 05:46
					8. Hanatan - WAVE - 03:16
					9. 【ぽこた】サンドリヨン（Cendrillon）10th Anniversary　歌ってみた【花たん】 - 04:42
					10. Hanatan - Tell Your World - 04:19
					1. Hanatan - Senbonzakura (Suzumu Remix) - 04:11
					2. Hanatan - Romeo and Cinderella - 04:39
					3. Hanatan - Tengaku - 04:36
					4. 【1 Hour】YURiCa/Hanatan [花たん] Best Songs Playlist - Emotional Voice - 01:08:38
					5. Hanatan - Ghost Rule - 03:28
					6. KikuoHana - ヒトガワリ - 04:25
					7. Hanatan - Niwaka Ame - 05:46
					8. Hanatan - WAVE - 03:16
					9. 【ぽこた】サンドリヨン（Cendrillon）10th Anniversary　歌ってみた【花たん】 - 04:42
					10. Hanatan - Tell Your World - 04:19

					`
				)
		await interaction.reply({embeds: [testEmbed]});
	},
};