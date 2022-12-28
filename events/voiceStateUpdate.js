const client = require('../shoobot');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        // FIX THIS!
        // Is just band-aid
        try {
            if (newState.channelId != null) {
                const guildId = newState.guild.id;
                const channelId = newState.channel.id;
                const voiceChannel = client.guilds.cache.get(guildId).channels.cache.get(channelId);

                if (newState.id === client.user.id) {
                    return
                }

                if (voiceChannel.members.size == 2) {
                    await client.distube.resume(newState.channel);
                }

                if (voiceChannel.members.size < 2) {
                    client.distube.pause(newState.channel);
                }

            } else if (oldState.channelId != null) {
                const guildId = oldState.channel.guild.id;
                const channelId = oldState.channel.id;
                const voiceChannel = client.guilds.cache.get(guildId).channels.cache.get(channelId);

                if (oldState.id === client.user.id) {
                    return
                }

                if (voiceChannel.members.size == 2) {
                    await client.distube.resume(oldState.channel);
                }

                if (voiceChannel.members.size < 2) {
                    client.distube.pause(oldState.channel);
                }
            }

        } catch (error) {
            console.log(error)
        }

    },
};