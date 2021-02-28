/**
 * Starts a game.
 */

const StateManager = require("../../state/state-manager");
const { handleInfo } = require("../../handlers/bot-embed");

module.exports = {
    name: 'game',
    description: 'Starts a game.\n\nAvailable games:\n🔹\`roulette\`\n🔹\`trivia\`',
    type: 'game',
    aliases: ['g'],
    args: false,
    guildOnly: true,
    cooldown: 5,
    execute(msg, args) {

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            if (!oGuild.gameManager.currentGame) {
                oGuild.gameManager.startGame(msg, args[0]);
            } else {
                return msg.channel.send(handleInfo(`There is currently \`${oGuild.gameManager.currentGame.name}\` in progress.`, 'info'));
            }
            
        });

    }
}