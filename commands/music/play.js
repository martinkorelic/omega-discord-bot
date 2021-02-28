/**
 * Plays a song.
 */

const StateManager = require("../../state/state-manager");

module.exports = {
    name: 'play',
    description: 'Plays a song.',
    type: 'music',
    aliases: ['p'],
    args: true,
    guildOnly: true,
    usage: '<link or position>',
    cooldown: 1,
    execute(msg, args) {

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            if (isNaN(args[0])) {
                oGuild.musicManager.checkAndPlay(msg, args[0], true);
            } else {
                let number = Number(args[0]).toFixed(0);
                oGuild.musicManager.skipTo(msg, number);
            }
            
        });

    }
}