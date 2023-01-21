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
                    const pvp = reaction.message.guild.roles.cache.find((role) => role.name == 'PvP');

                    if (!wvw || !pve) return;

                    if ((reaction.emoji.name === '🔵')) {
                        member.roles.add(wvw);
                    }

                    if ((reaction.emoji.name === '🟠')) {
                        member.roles.add(pve);
                    }

                    if ((reaction.emoji.name === '🟢')) {
                        member.roles.add(pvp);
                    }
                    break;

                case '1018795923092033586':
                    const ok = reaction.message.guild.roles.cache.find((role) => role.name == 'ok');
                    const mgs = reaction.message.guild.roles.cache.find((role) => role.name == 'MGS');
                    const cf = reaction.message.guild.roles.cache.find((role) => role.name == 'CF');
                    const hide = reaction.message.guild.roles.cache.find((role) => role.name == 'HiDe');
                    // const ip = reaction.message.guild.roles.cache.find((role) => role.name == 'iP');
                    const guest = reaction.message.guild.roles.cache.find((role) => role.name == 'Guest');

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

                    if (reaction.emoji.name === '⚪') {
                        member.roles.add(guest);
                    }

                    // if (reaction.emoji.name === '🟠') {
                    //     member.roles.add(ip);
                    // }
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.log(error)
        }
    },
};