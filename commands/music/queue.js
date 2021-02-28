/**
 * Displays the current queue.
 */

const StateManager = require("../../state/state-manager");

module.exports = {
    name: 'queue',
    description: 'Displays the current queue.',
    type: 'music',
    aliases: ['q'],
    guildOnly: true,
    cooldown: 5,
    execute(msg, args) {

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            oGuild.musicManager.getSongQueue(msg);

        });


    }
}