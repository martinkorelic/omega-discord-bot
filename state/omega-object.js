const { handleInfo, handleOther, handleError } = require("../handlers/bot-embed");
const { OmegaGameManager } = require("../managers/OmegaGameManager");
const { OmegaMusicManager } = require("../managers/OmegaMusicManager");

class Omega {

    constructor(serverId, serverName) {

        // Basic info
        this.serverId = serverId;
        this.serverName = serverName;
        
        // Channels
        this.botLogChannel = '';
        this.hofChannel = '';

        // Managers
        this.musicManager = new OmegaMusicManager;
        this.gameManager = new OmegaGameManager;

        // Roles
        this.defaultRoleId = '';
        this.punishedRoleId = '';

        //Punished members
        this.punishedMembers = [];
    }

    setHofChannel(channelId) {

        this.hofChannel = channelId;
    }

    setLogChannel(channelId) {

        this.botLogChannel = channelId;
    }

    setDefaultRole(roleId) {

        this.defaultRoleId = roleId;
    }

    setPunishedRole(msg, roleId) {

        if (this.punishedRoleId !== roleId) {

            this.punishedRoleId = roleId;
            let members = msg.guild.members.cache;

            for (var pMember in this.punishedMembers) {

                pMember = members.get(this.punishedMembers[pMember]);

                var isBooster = pMember.roles.cache.some(role => role.name == "Server Booster");
                var boostRoleId = msg.guild.roles.cache.find((role) => role.name == "Server Booster");

                console.log(isBooster);

                if (isBooster) {

                    pMember.roles.set([this.punishedRoleId, boostRoleId.id]);

                } else {

                    pMember.roles.set([this.punishedRoleId]);

                }

            }
        }

    }

    sendBotLog(msg, content) {
        
        if (msg.guild.channels.cache.has(this.botLogChannel)) {
            
            return msg.guild.channels.cache.get(this.botLogChannel).send(content);
        } 

        msg.channel.send(content);
        return msg.channel.send(handleInfo('Note: Bot log channel does not exist or it is not set. Use `setlog` command.', 'missing-set'));
    }

    sendHofMsg(msg, args) {

        if (!msg.guild.channels.cache.has(this.hofChannel)) {
            return 'Hall of fame has not been set or does not exist!';
        }

        let halloffameChannel = msg.guild.channels.cache.get(this.hofChannel); 
        
        for (var i = 0; i < args.length; i++) {
            msg.channel.messages.fetch(args[i])
            .then(messaz => {
                
                halloffameChannel.send(handleOther({
                    avatar: messaz.author.avatarURL(),
                    author: messaz.author.id
                }, 'pin-info'));

                if (messaz.attachments.size != 0) {
                    var collections = messaz.attachments.array();
                    var atch = collections[0].attachment;
        
                    halloffameChannel.send(({
                        files: [{
                        attachment: atch
                        }]
                    }));
        
                    if (messaz.content != "")
                        halloffameChannel.send(messaz.content);
        
                } else if (messaz.embeds.length !== 0) {
                    halloffameChannel.send(messaz.embeds[0]);
                }else {
                    halloffameChannel.send(messaz.content);
                }
                
            })
            .catch(error => {
                msg.channel.send(handleError("Error sending message!", 'internal-error'));
                console.log(error);
            });
        }

        return 'Message has been pinned.';
    }

    punishMember(msg, memberId, reason) {

        if (!msg.guild.roles.cache.has(this.punishedRoleId)) {

            return `Punished role is not set or does not exist!`;
        }

        if (this.punishedMembers.includes(memberId)) {

            return `Member <@${memberId}> is already punished!`;
        }

        var pMember = msg.guild.members.cache.get(memberId);

        if (pMember.roles.cache.has(this.punishedRoleId)) {

            return `Member <@${memberId}> has already been assigned punished role!`;
        }

        this.punishedMembers.push(memberId);
        var isBooster = pMember.roles.cache.some(role => role.name == "Server Booster");
        var boostRoleId = msg.guild.roles.cache.find((role) => role.name == "Server Booster");

        if (isBooster) {

            pMember.roles.set([this.punishedRoleId, boostRoleId.id]);

        } else {

            pMember.roles.set([this.punishedRoleId]);

        }

        return `Member <@${memberId}> was punished by <@${msg.author.id}>!\n\n${reason ? 'Reason: \`' + reason + '\`' : ''}`;
    }

    unpunishMember(msg, memberId) {

        if (!msg.guild.roles.cache.has(this.defaultRoleId)) {

            return `Default role is not set or does not exist!`;
        }

        if (!this.punishedMembers.includes(memberId)) {

            return `Member <@${memberId}> is not punished!`;
        }
        
        var uMember = msg.guild.members.cache.get(memberId);

        if (uMember.roles.cache.has(this.defaultRoleId)) {

            return `Member <@${memberId}> has already been assigned default role!`;
        }

        this.punishedMembers.pop(this.punishedMembers.findIndex((member) => member == memberId));

        var isBooster = uMember.roles.cache.some(role => role.name == "Server Booster");
        var boostRoleId = msg.guild.roles.cache.find((role) => role.name == "Server Booster");

        if (isBooster) {

            uMember.roles.set([this.defaultRoleId, boostRoleId.id]);

        } else {

            uMember.roles.set([this.defaultRoleId]);

        }

        return `Member <@${memberId}> was unpunished by <@${msg.author.id}>!`;

    }

    checkMember(member) {

        if (!member.guild.roles.cache.has(this.defaultRoleId) && !member.guild.roles.cache.has(this.defaultRoleId)) return;
        
        if (this.punishedMembers.includes(member.id)) {

            member.roles.set([this.punishedRoleId]);

            if (this.botLogChannel !== '') {
                member.guild.channels.cache.get(this.botLogChannel).send(handleOther(`<@${member.id}> tried to enter the guild but was punished!`, 'omega-watch'));
            }

        } else {

            member.roles.set([this.defaultRoleId]);

            if (this.botLogChannel !== '') {

                member.guild.channels.cache.get(this.botLogChannel).send(handleOther(`<@${member.id}> entered the guild and was assigned default role!`, 'omega-watch'));
            }

        }

    }

    // Part of Omega Watch
    loadMembers(members) {
        
        members.each((m) => {
            
            if (m.roles.cache.has(this.punishedRoleId)) {

                this.punishedMembers.push(m.id);
            }
        
        });
        
    }

}

module.exports = {
    Omega
};