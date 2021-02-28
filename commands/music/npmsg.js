/**
 * Turns off now playing messages.
 */

const StateManager = require("../../state/state-manager");

module.exports = {
    name: 'npmsg',
    description: 'Turns off now playing messages.',
    type: 'music',
    guildOnly: true,
    cooldown: 1,
    execute(msg, args) {

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            oGuild.musicManager.setNpMsg(msg);

        });

    }
}