/**
 * Displays the user's current balance.
 */

const { balanceCheck, topBalances } = require("../../handlers/bot-postgres")
const { handleOther, handleError } = require("../../handlers/bot-embed");

module.exports = {
    name: 'balance',
    description: 'Displays the user\'s current balance.\n\nArguments:\n🔹`top`- displays top 10 richest users',
    type: 'balance',
    aliases: ['b'],
    guildOnly: true,
    usage: '<args>',
    cooldown: 5,
    async execute(msg, args) {

        if (args[0] == 'top') {
            var results = await topBalances();

            return msg.channel.send(handleOther(results, 'balance-top'));
        }

        var res = await balanceCheck(msg.author.id);

        if (res[1] == -1) {

            return msg.channel.send(handleError('The user has not initialized his wallet yet. Use command `daily` to initialize a wallet first.', 'user-mistake'));
        } 

        return msg.channel.send(handleOther( { author: msg.author.id, balance: res[1] },'balance-info'));

    }
}