/** 
 * Ask the 8ball a question.  
*/
const { handleOther, handleError } = require('../../handlers/bot-embed');

module.exports = {
    name: '8ball',
    description: 'Ask the 8ball a question.',
    type: 'fun',
    guildOnly: true,
    cooldown: 2,
    execute(msg, args) {
        
        return msg.channel.send(handleOther('', '8ball'));
    }
}