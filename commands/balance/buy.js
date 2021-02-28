/**
 * Buys an item.
 */
const { itemHandler } = require('../../handlers/bot-postgres');
const { handleOther } = require("../../handlers/bot-embed");

module.exports = {
    name: 'buy',
    description: 'Buys an item.',
    type: 'balance',
    guildOnly: true,
    args: true,
    usage: '<short name of item>',
    cooldown: 10,
    async execute(msg, args) {
        
        var res = await itemHandler(msg.author.id, msg.author.username, 'buy', args[0]);
        return msg.channel.send(handleOther(res, 'store-buy'));
        
    }
}