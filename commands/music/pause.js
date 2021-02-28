/**
 * Pauses a song.
 */

const StateManager = require("../../state/state-manager");

module.exports = {
    name: 'pause',
    description: 'Pauses a song.',
    type: 'music',
    guildOnly: true,
    cooldown: 1,
    execute(msg, args) {

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            oGuild.musicManager.pauseSong(msg);

        });


    }
}