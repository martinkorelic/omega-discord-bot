/**
 * Punishes a member. Punished role must be set.
 */
const StateManager = require('../../state/state-manager');
const { handleError, handleInfo } = require('../../handlers/bot-embed');
const OMEGA_ID = require('../../config/info.json').omegaId;
const { checkRoles } = require('../../helping-functions/omega-help-func');

module.exports = {
    name: 'unpunish',
    description: 'Upunishes a member. Default role must be set. Use \`setrole default\` to set a punished role.',
    type: 'mod',
    args: true,
    guildOnly: true,
    usage: '<member> <reason>',
    permission: ['MANAGE_ROLES'],
    cooldown: 2,
    execute(msg, args) {

        //Check if user has permissions to do this action
        if (!msg.member.hasPermission(this.permission[0])) {
            return msg.channel.send(handleError('User does not have the `Manage Roles` permission!', 'missing-perm'));
        }

        let memberId = args[0].replace(/[^0-9]/g, '');

        if (memberId == OMEGA_ID) {
            return msg.channel.send(handleError('Cannot unpunish myself!', 'user-mistake'));
        }

        //Check if member exists
        if (!msg.guild.members.cache.has(memberId)) {
            return msg.channel.send(handleError('User does not exist in this server.', 'user-mistake'));
        }

        let requestedMember = msg.guild.members.cache.get(memberId).roles.cache;
        let omegaRoles = StateManager.getServerClientOmega(msg.guild.id).members.cache.get(OMEGA_ID).roles.cache;
        let memberRoles = msg.member.roles.cache;

        if (!checkRoles(omegaRoles, requestedMember)) {
            return msg.channel.send(handleError('I am not allowed to unpunish members equal or above me. 😳', 'internal-error'));
        }

        if (!checkRoles(memberRoles, requestedMember) && !msg.member.hasPermission('ADMINISTRATOR')) {
            return msg.channel.send(handleError('You are not allowed to unpunish roles above you except if you are an administrator!','user-mistake'));
        }

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {
            
            
            return oGuild.sendBotLog(msg, handleInfo(oGuild.unpunishMember(msg, memberId), 'info'));
        });

    }
}