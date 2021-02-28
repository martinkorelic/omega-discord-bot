/**
 * Displays the user inventory.
 */

const { viewInventory } = require('../../handlers/bot-postgres');
const { handleOther } = require("../../handlers/bot-embed");

module.exports = {
    name: 'inventory',
    description: 'Displays the user inventory.',
    type: 'balance',
    aliases: ['inv'],
    guildOnly: true,
    cooldown: 15,
    async execute(msg, args) {
        
        var res = await viewInventory(msg.author.id, msg.author.username);

        if (res[0]) {

            msg.channel.send(handleOther({ res: res[1], author: msg.author.username }, 'inv-list'));
            
        } else {

            msg.channel.send(handleInfo(res[1], 'info'));
        }
        
    }
}