/**
 * Joins a game.
 */

const StateManager = require("../../state/state-manager");
const botGames = require("../../handlers/bot-games");
const { handleInfo, handleError, handleOther } = require("../../handlers/bot-embed");

module.exports = {
    name: 'joing',
    description: 'Joins the game.',
    type: 'game',
    aliases: ['jg'],
    guildOnly: true,
    cooldown: 5,
    execute(msg, args) {

        StateManager.serverAvailable(msg.guild.id, (oGuild) => {

            //oGuild.gameManager.startGame(msg, args[0]);
            var cg = oGuild.gameManager.currentGame

            if (cg instanceof botGames.CockyS) {

                if (!cg.addUser(msg.author.id)) {
                    return msg.channel.send(handleInfo(`User ${msg.author} is already in game.`, 'info'));
                }

            } else if (cg instanceof botGames.Roulette && args[0] && args[1]) {
                // args: (amount) (place)
                let amount = 0;
                let number = -1;
                let colour = args[1];

                if (isNaN(args[0])) {
                    
                    return msg.channel.send(handleError('Please input a number between 10 and 2000000.', 'user-mistake'));
                }

                amount = parseInt(args[0]);

                if (amount < 10 || amount > 2000000) {
                    
                    return msg.channel.send(handleError('Please input a number between 10 and 2000000.', 'user-mistake'));
                }

                if (isNaN(args[1])) {
                    //Red, black or green
                    if (args[1] !== 'red' && args[1] !== 'black' && args[1] !== 'green') {
                        return msg.channel.send(handleError('Please input \`red/black/green\` when betting on colours.', 'user-mistake'));
                    }

                } else {
                    number = parseInt(args[1]);

                    if (number > 36 || number < 0) {
                        return msg.channel.send(handleError('Please input a number between 0 and 36 when betting on numbers.', 'user-mistake'));
                    }

                }
                let userAdded = cg.addUser(msg.author.id, amount, number, colour);
                if (!userAdded) {
                    return msg.channel.send(handleInfo(`User ${msg.author} is already in game.`, 'info'));
                }
                return msg.channel.send(handleOther({
                    author: msg.author.id,
                    amount: amount,
                    number: number,
                    colour: colour
                }, 'game-roulette-bet'));
            } else if (cg instanceof botGames.Trivia && args[0]) {

                let answers = cg.answers;

                if (isNaN(args[0])) {
                    return msg.channel.send(handleError(`Please input a number from \`1 - ${answers.length}\``, 'user-mistake'));
                }

                let number = parseInt(args[0])

                if (number > answers.length || number < 1) {
                    return msg.channel.send(handleError(`Please input a number from \`1 - ${answers.length}\``, 'user-mistake'));
                }

                let userAdded = cg.addUser(msg.author.id, msg.author.username, number);
                if (!userAdded) {
                    return msg.channel.send(handleInfo(`User ${msg.author} is already in game.`, 'info'));
                }
                return msg.channel.send(handleOther({
                    author: msg.author.username,
                    answerChosen: answers[number-1],
                    avatar: msg.author.avatarURL()
                }, 'game-trivia-answer'));
            } else {
                msg.channel.send(handleInfo('There is no active game in progress.', 'info'));
            }

        });

    }
}