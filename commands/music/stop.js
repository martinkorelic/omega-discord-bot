/**
 * Stops the player.
 */

const StateManager = require("../../state/state-manager");

module.exports = {
    name: 'stop',
    description: 'Stops the player.',
    type: 'music',
    guildOnly: true,
    cooldown: 1,
    execute(msg, args) {

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            oGuild.musicManager.disconnectVC(msg);

        });

    }
}