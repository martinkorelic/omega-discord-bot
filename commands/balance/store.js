/**
 * Displays the Omega store.
 */

const { store } = require("../../handlers/bot-store");
const { handleOther } = require("../../handlers/bot-embed");

module.exports = {
    name: 'store',
    description: 'Displays the Omega store.',
    type: 'balance',
    guildOnly: true,
    cooldown: 5,
    async execute(msg, args) {
        
        var res = store.listAllItems();

        return msg.channel.send(handleOther(res, 'store-list'));
        
    }
}