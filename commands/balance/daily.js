/**
 * Initializes the wallet and gives daily coins.
 */

const { giffCoins } = require("../../handlers/bot-postgres")
const { handleOther, handleError, handleInfo } = require("../../handlers/bot-embed");

module.exports = {
    name: 'daily',
    description: 'Initializes the wallet and gives daily coins.',
    type: 'balance',
    aliases: ['d'],
    guildOnly: true,
    cooldown: 5,
    async execute(msg, args) {

        // Boosters get +1500 OmegaCoins
        var isBooster = msg.member.roles.cache.some(role => role.name == "Server Booster");
                    
        var results = await giffCoins(msg.author.id, msg.author.username, isBooster);

        if (results[0]) {

            return msg.channel.send(handleOther({ author: msg.author.id, res: results[1] }, 'balance-giff'))
        } 
        
        return msg.channel.send(handleInfo(results[1],'info'));
        
    }
}