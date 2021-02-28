/** 
 * Insult yourself.  
*/
const axios = require('axios');
const { handleOther, handleError } = require('../../handlers/bot-embed');

module.exports = {
    name: 'insult',
    description: 'Insult yourself.',
    type: 'fun',
    guildOnly: true,
    cooldown: 20,
    execute(msg, args) {
        
        axios.get(`https://evilinsult.com/generate_insult.php?lang=en&type=json`)
        .then(res => {

            msg.channel.send(handleOther(res.data.insult, 'insult'));

        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                msg.channel.send(handleError(error.response.status, 'api-error'));
            } else if (error.isAxiosError) {
                msg.channel.send(handleError('Whoops! Looks like something went wrong.', 'internal-error'));
            }
        });

    }
}