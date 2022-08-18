module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user) {

        if (reaction.partial) {
            try {
                await reaction.message.fetch();
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message: ', error);
            }
        }

        const member = reaction.message.guild.members.cache.get(user.id);

        const messageId = reaction.message.id;
        console.log(reaction.emoji.id);
        switch (messageId) {
            case '1003356612699897879':
                const wvw = reaction.message.guild.roles.cache.find((role) => role.name == 'WvW');
                const pve = reaction.message.guild.roles.cache.find((role) => role.name == 'PvE');

                if (!wvw || !pve) return;

                if ((reaction.emoji.name === '🔵')) {
                    member.roles.add(wvw);
                }

                if ((reaction.emoji.name === '🟠')) {
                    member.roles.add(pve);
                }
                break;

            case '1003355134966906901':
                const lottery = reaction.message.guild.roles.cache.find((role) => role.name == 'Lottery');
                
                if (!lottery) return;
                
                if (reaction.emoji.name === '🪙') {
                    member.roles.add(lottery);
                }
                break;

            default:
                break;
        }
    },
};