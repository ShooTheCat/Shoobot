module.exports = {
    name: 'messageReactionRemove',
    async execute(reaction, user) {
        try {

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

                case '1018795923092033586':
                    const ok = reaction.message.guild.roles.cache.find((role) => role.name == 'ok');
                    const mgs = reaction.message.guild.roles.cache.find((role) => role.name == 'MGS');
                    const cf = reaction.message.guild.roles.cache.find((role) => role.name == 'CF');
                    const hide = reaction.message.guild.roles.cache.find((role) => role.name == 'HiDe');

                    if (!ok || !mgs || !cf || !hide) return;

                    if (reaction.emoji.name === '🟣') {
                        member.roles.remove(ok);
                    }

                    if (reaction.emoji.name === '🔴') {
                        member.roles.remove(mgs);
                    }

                    if (reaction.emoji.name === '🟢') {
                        member.roles.remove(cf);
                    }

                    if (reaction.emoji.name === '🔵') {
                        member.roles.remove(hide);
                    }
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.log(error);
        }

    },
};