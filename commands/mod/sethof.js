/** 
 * Set the channel for hall of fame 
 *  
*/
const StateManager = require('../../state/state-manager');
const { handleError, handleInfo } = require('../../handlers/bot-embed');

module.exports = {
    name: 'sethof',
    description: 'Sets the hall of fame channel.',
    type: 'mod',
    args: true,
    guildOnly: true,
    usage: '<channel>',
    permission: ['MANAGE_CHANNELS'],
    cooldown: 5,
    execute(msg, args) {
        
        let channelId = args[0].replace(/[^0-9]/g, '');

        //Check if user has permissions to do this action
        if (!msg.member.hasPermission(this.permission[0])) {
            return msg.channel.send(handleError('User does not have the `Manage Channels` permission!', 'missing-perm'));
        }

        //Channel does not exist
        if (!msg.guild.channels.cache.has(channelId)) {
            return msg.channel.send(handleError('Channel does not exist!', 'user-mistake'));
        }

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {
            
            oGuild.setHofChannel(channelId);
            return oGuild.sendBotLog(msg, handleInfo(`Hall of fame channel was binded to <#${channelId}>.`, 'info'));
        });
    }
}