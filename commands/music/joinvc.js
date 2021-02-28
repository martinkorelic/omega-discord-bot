/**
 * Joins a voice channel.
 */

const StateManager = require("../../state/state-manager");

module.exports = {
    name: 'joinvc',
    description: 'Joins a voice channel.',
    type: 'music',
    aliases: ['jv'],
    guildOnly: true,
    cooldown: 5,
    execute(msg, args) {

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            oGuild.musicManager.joinVC(msg);

        });

    }
}