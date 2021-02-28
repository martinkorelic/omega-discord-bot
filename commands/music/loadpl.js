/**
 * Loads a preset playlist.
 */

const StateManager = require("../../state/state-manager");

module.exports = {
    name: 'loadpl',
    description: 'Loads a preset playlist.',
    type: 'music',
    aliases: ['lp'],
    guildOnly: true,
    cooldown: 1,
    execute(msg, args) {

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            oGuild.musicManager.loadPlaylist(msg, args[0]);

        });

    }
}