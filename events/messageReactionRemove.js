module.exports = {
	name: 'messageReactionRemove',
	async execute(reaction, user) {

        if (reaction.partial) {
            try {
                await reaction.message.fetch();
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the reaction: ', error);
            }
        }

        const member = reaction.message.guild.members.cache.get(user.id);

        const messageId = reaction.message.id;
        
        switch (messageId) {
            case '1003356612699897879':
                const wvw = reaction.message.guild.roles.cache.find((role) => role.name == 'WvW');
                const pve = reaction.message.guild.roles.cache.find((role) => role.name == 'PvE');

                if (!wvw || !pve) return;

                if ((reaction.emoji.name === '🔵')) {
                    member.roles.remove(wvw);
                }

                if ((reaction.emoji.name === '🟠')) {
                    member.roles.remove(pve);
                }
                break;

            case '1003355134966906901':
                const lottery = reaction.message.guild.roles.cache.find((role) => role.name == 'Lottery');
                
                if (!lottery) return;
                
                if (reaction.emoji.name === '🪙') {
                    member.roles.remove(lottery);
                }
                break;

            default:
                break;
        }
	},
};