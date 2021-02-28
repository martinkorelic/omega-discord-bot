/**
 * Skips a song.
 */

const StateManager = require("../../state/state-manager");

module.exports = {
    name: 'skip',
    description: 'Skips a song.',
    type: 'music',
    aliases: ['s'],
    guildOnly: true,
    cooldown: 10,
    execute(msg, args) {

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            oGuild.musicManager.skipSong(msg);

        });

    }
}