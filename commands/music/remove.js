/**
 * Removes a song from queue.
 */

const StateManager = require("../../state/state-manager");
const { handleError } = require("../../handlers/bot-embed");

module.exports = {
    name: 'remove',
    description: 'Removes a song from queue.',
    type: 'music',
    aliases: ['r'],
    guildOnly: true,
    cooldown: 5,
    execute(msg, args) {
        let number = Number(args[0]).toFixed(0);

        if (isNaN(args[0])) {
            
            return msg.channel.send(handleError('Please input a number value.', 'user-mistake'));
        }

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            oGuild.musicManager.removeSong(msg, number);

        });

    }
}