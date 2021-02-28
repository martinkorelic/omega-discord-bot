/**
 * Call out someone for simping.
 */
/** 
 * Kiss someone :flushed:.  
*/
const { handleOther, handleError } = require('../../handlers/bot-embed');

module.exports = {
    name: 'simp',
    description: 'Call out someone for simping.',
    type: 'fun',
    guildOnly: true,
    args: true,
    usage: '<user>',
    cooldown: 2,
    execute(msg, args) {
        args[0] = args[0].replace(/[^0-9]/g, "");

        var mentionedMember = msg.guild.members.cache.get(args[0]);

        if (!mentionedMember) {
            return msg.channel.send(handleError('Mentioned member does not exist.', 'user-mistake'));
        }

        return msg.channel.send(handleOther({
            mentionedMember: mentionedMember.user.username,
            avatar: mentionedMember.user.avatarURL()
        }, 'simp'));
        
    }
}