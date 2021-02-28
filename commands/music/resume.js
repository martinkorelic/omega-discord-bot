/**
 * Resumes a song.
 */

const StateManager = require("../../state/state-manager");

module.exports = {
    name: 'resume',
    description: 'Resume a song.',
    type: 'music',
    guildOnly: true,
    cooldown: 1,
    execute(msg, args) {

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            oGuild.musicManager.resumeSong(msg);

        });


    }
}