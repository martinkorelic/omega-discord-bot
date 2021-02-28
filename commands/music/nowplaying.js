/**
 * Displays the current song.
 */

const StateManager = require("../../state/state-manager");

module.exports = {
    name: 'nowplaying',
    description: 'Displays the current song.',
    type: 'music',
    aliases: ['np'],
    guildOnly: true,
    cooldown: 1,
    execute(msg, args) {

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            oGuild.musicManager.nowPlaying(msg);

        });

    }
}