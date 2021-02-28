/**
 * Pin a message to hall of fame channel
 */
const StateManager = require('../../state/state-manager');
const { handleInfo } = require('../../handlers/bot-embed');

module.exports = {
    name: 'pin',
    description: 'Pins a message and attachments in hall of fame channel. Hall of fame channel must be set.',
    type: 'mod',
    args: true,
    guildOnly: true,
    usage: '<message id>',
    cooldown: 5,
    execute(msg, args) {

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            return msg.channel.send(handleInfo(oGuild.sendHofMsg(msg, args), 'info'));
        }); 

        
    }
}


