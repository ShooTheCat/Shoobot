const { prefix } = require('../config.json');

module.exports = {
	name: 'messageCreate',
	async execute(message) {
		if (message.content.includes("@here") || message.content.includes("@everyone")) return false;

		if ((message.mentions.has(message.client.user.id)) && (!message.author.bot)) {
			return message.channel.send("https://i.imgur.com/6qy3fWE.gif");
		}

		if (message.author.bot) return;
		if (!message.content.startsWith(prefix)) return;

		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();
		const command = message.client.commands.get(commandName)
		if (!command) return;

		if (command.args && !args.length) {
			return message.channel.send(`You didn't provide any arguments!`);
		}

		try {
			await command.execute(message, args);
		} catch (error) {
			console.error(error);
			await message.channel.send(`Something went wrong! <@${shooId}>`);
		}

	},
};