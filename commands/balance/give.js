/**
 * Give coins to another user.
 */

const { giveCoinsTo } = require("../../handlers/bot-postgres")
const { handleOther, handleError, handleInfo } = require("../../handlers/bot-embed");

module.exports = {
    name: 'give',
    description: 'Give coins to another user.',
    type: 'balance',
    guildOnly: true,
    args: true,
    cooldown: 30,
    async execute(msg, args) {

        if (!args[1]) {

            return msg.channel.send(handleError('Please specify another user.', 'user-mistake'));
        }

        var mentionedMember = args[1].replace(/[^0-9]/g, "");

        if (msg.author.id == mentionedMember) {

            return msg.channel.send(handleError('Cannot give to yourself.', 'user-mistake'));
        }

        if (isNaN(args[0])) {

            return msg.channel.send(handleError('Please input a number between 500 and 2000000', 'user-mistake'));
        }

        let amount = parseInt(args[0]);

        if (amount < 500 || amount > 2000000) {

            return msg.channel.send(handleError('Please input a number between 500 and 2000000', 'user-mistake'));
        }
            
        var res = await giveCoinsTo(amount, msg.author.id, mentionedMember);
        
        return msg.channel.send(handleOther(res, 'balance-give'));
                
    }
}