module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user) {
        try {

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

            switch (messageId) {
                case '1018873593989443694':
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

                case '1018909398183186482':
                    const test = reaction.message.guild.roles.cache.find((role) => role.name == 'test');

                    if (!test) return;

                    if (reaction.emoji.name === '🟣') {
                        member.roles.add(test);
                    }
                    break;

                case '1018795923092033586':
                    const ok = reaction.message.guild.roles.cache.find((role) => role.name == 'ok');
                    const mgs = reaction.message.guild.roles.cache.find((role) => role.name == 'MGS');
                    const cf = reaction.message.guild.roles.cache.find((role) => role.name == 'CF');
                    const hide = reaction.message.guild.roles.cache.find((role) => role.name == 'HiDe');

                    if (!ok || !mgs || !cf || !hide) return;

                    if (reaction.emoji.name === '🟣') {
                        member.roles.add(ok);
                    }

                    if (reaction.emoji.name === '🔴') {
                        member.roles.add(mgs);
                    }

                    if (reaction.emoji.name === '🟢') {
                        member.roles.add(cf);
                    }

                    if (reaction.emoji.name === '🔵') {
                        member.roles.add(hide);
                    }
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.log(error)
        }
    },
};