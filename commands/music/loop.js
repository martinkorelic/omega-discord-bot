/**
 * Loops a playlist.
 */

const StateManager = require("../../state/state-manager");

module.exports = {
    name: 'loop',
    description: 'Loops a playlist.',
    type: 'music',
    aliases: ['l'],
    guildOnly: true,
    cooldown: 1,
    execute(msg, args) {

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            oGuild.musicManager.setLoop(msg);

        });

    }
}