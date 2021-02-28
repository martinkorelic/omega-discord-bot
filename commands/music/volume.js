/**
 * Sets the volume for a song.
 */

const StateManager = require("../../state/state-manager");
const { handleError } = require("../../handlers/bot-embed");

module.exports = {
    name: 'volume',
    description: 'Sets the volume for a song.\n1 is normal, 0.5 is half, 2 is double. Goes up to 4.',
    type: 'music',
    aliases: ['v'],
    guildOnly: true,
    args: true,
    usage: '<value>',
    cooldown: 1,
    execute(msg, args) {
        let number = Number(args[0]).toFixed(1);
        
        if (isNaN(args[0]) || number > 4 || number < 0) {
            
            return msg.channel.send(handleError('Please input a value from 0 to 4.', 'user-mistake'));
        }
        
        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            oGuild.musicManager.setVolume(msg, number);

        });
    }
}