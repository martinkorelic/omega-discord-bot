const { Omega } = require('./omega-object');
const Discord = require('discord.js');
const presets = require('../config/presets.json');

class StateManager {

    constructor() {

        this.serverList = new Discord.Collection();
        this.client = null;
    }

    init(servers, client) {

        this.client = client;

        for (var guild of servers.array()) {

            this.serverList.set(guild.id, new Omega(guild.id, guild.name));
        }

    }

    serverAvailable(serverId, callback) {

        var servar = this.serverList.get(serverId);
        var server = this.client.guilds.cache.get(serverId);
        
        if (!servar || !server.available) {
            return;
        }

        return callback(this.serverList.get(serverId));
    }

    serverAdd(guild) {

        this.serverAvailable(guild, (serverId) => {
            this.serverList[serverId] = new Omega(serverId);
        });

    }

    getServerClientOmega(guildId) {

        return this.client.guilds.cache.get(guildId);
    }

    loadPresets() {
        
        for (var serverId in presets) {

            var server = this.serverList.get(serverId);
            if (server) {
                server.botLogChannel = presets[serverId].botLogChannelId;
                server.hofChannel = presets[serverId].hofChannelId;

                server.defaultRoleId = presets[serverId].defaultRoleId;
                server.punishedRoleId = presets[serverId].punishedRoleId;
            }
        }
    }
}


module.exports = new StateManager;