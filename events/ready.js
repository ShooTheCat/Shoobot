module.exports = {
    name: 'ready',
	once: true,
	execute(client) {
		console.log(`Logged in!\nBot Account: ${client.user.tag}\nBot Username: ${client.user.username}`);
	},
};