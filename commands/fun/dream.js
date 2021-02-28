/** 
 * Dream.  
*/
const axios = require('axios');
const { handleOther, handleError } = require('../../handlers/bot-embed');

module.exports = {
    name: 'dream',
    description: 'Dream of a place or thing.',
    type: 'fun',
    args: true,
    guildOnly: true,
    usage: '<word>',
    cooldown: 20,
    execute(msg, args) {
        
        axios.get(`https://source.unsplash.com/1600x900/?${args[0]}`)
        .then(res => {
            msg.channel.send(handleOther({
                avatar: msg.author.avatarURL(),
                author: msg.author.username,
                url: res.request.res.responseUrl,
                keyword: args[0]
            },'dream'));
        }).catch(error => {
            console.log(error);
            if (error.response) {
                msg.channel.send(handleError(error.response.status, 'api-error'));
            } else if (error.isAxiosError) {
                msg.channel.send(handleError('Whoops! Looks like something went wrong.', 'internal-error'));
            }
        });

    }
}