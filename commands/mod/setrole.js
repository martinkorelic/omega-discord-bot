/**
 * Sets the default role for the server. When the user joins the server it is assigned this role.
 */
const StateManager = require('../../state/state-manager');
const { handleError, handleInfo } = require('../../handlers/bot-embed');
const { checkRoles } = require('../../helping-functions/omega-help-func');
const OMEGA_ID = require('../../config/info.json').omegaId;

module.exports = {
    name: 'setrole',
    description: 'Sets the roles for the server.\n\nArguments:\n🔹`default` - when the user joins the server or is unpunished it is assigned this role.\n🔹`punished` - role for punished users.',
    type: 'mod',
    args: true,
    guildOnly: true,
    usage: '<args> <role>',
    permission: ['MANAGE_ROLES'],
    cooldown: 5,
    execute(msg, args) {

        if (args[0] && args[1]) {

            let roleId = args[1].replace(/[^0-9]/g, '');

            //Check if user has permissions to do this action
            if (!msg.member.hasPermission(this.permission[0])) {
                return msg.channel.send(handleError('User does not have the `Manage Roles` permission!', 'missing-perm'));
            }

            //Role does not exist
            if (!msg.guild.roles.cache.has(roleId)) {
                return msg.channel.send(handleError('Role does not exist!', 'user-mistake'));
            }

            let requestedRole = msg.guild.roles.cache.get(roleId);

            let memberRole = msg.member.roles.cache;
            
            let omegaRoles = StateManager.getServerClientOmega(msg.guild.id).members.cache.get(OMEGA_ID).roles.cache;
            
            if (!checkRoles(omegaRoles, requestedRole)) {

                return msg.channel.send(handleError('I am not allowed to set roles that are equal or above me!', 'user-mistake'));
            }

            if (!checkRoles(memberRole, requestedRole)) {
                return msg.channel.send(handleError('You are not allowed to assign roles above you except if you are an administrator!','user-mistake'));
            }

            if (args[0] == 'default') {

                StateManager.serverAvailable(msg.guild.id, (oGuild) => {

                    if (oGuild.punishedRoleId == roleId) {

                        return msg.channel.send(handleError('Cannot set punished and default role to the same role!', 'user-mistake'));
                    }

                    oGuild.setDefaultRole(roleId);
                    return oGuild.sendBotLog(msg, handleInfo(`Default role was binded to \`${requestedRole.name}\`.`, 'info'));
                });
                return;
                
            } else if (args[0] == 'punished') {

                StateManager.serverAvailable(msg.guild.id, (oGuild) => {

                    if (oGuild.defaultRoleId == roleId) {
                        
                        return msg.channel.send(handleError('Cannot set punished and default role to the same role!', 'user-mistake'));
                    }

                    oGuild.setPunishedRole(msg, roleId);
                    return oGuild.sendBotLog(msg, handleInfo(`Punished role was binded to \`${requestedRole.name}\`.`, 'info'));
                });
                return;
            }
        } 

        return msg.channel.send(handleError(`Format the command like this \`${this.usage}\``, 'user-mistake'));   
    }
}