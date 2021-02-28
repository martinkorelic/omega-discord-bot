/** 
 * Dream about something random.  
*/
const axios = require('axios');
const { handleOther, handleError } = require('../../handlers/bot-embed');

module.exports = {
    name: 'dreamrnd',
    description: 'Dream of a random place or thing.',
    type: 'fun',
    args: false,
    guildOnly: true,
    cooldown: 20,
    execute(msg, args) {
        
        axios.get('https://picsum.photos/800/600')
                .then(res => {
                    msg.channel.send(handleOther({
                        avatar: msg.author.avatarURL(),
                        author: msg.author.username,
                        url: res.request.res.responseUrl
                    },'dream-rnd'));
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