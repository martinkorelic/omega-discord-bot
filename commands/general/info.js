/**
 * Displays info about the bot.
 */

const { handleOther } = require("../../handlers/bot-embed");
const botInfo = require('../../config/info.json');

module.exports = {
    name: 'info',
    description: 'Displays info about the bot.',
    type: 'general',
    guildOnly: true,
    execute(msg, args) {


        return msg.channel.send(handleOther(botInfo, 'bot-info'));

    }
}