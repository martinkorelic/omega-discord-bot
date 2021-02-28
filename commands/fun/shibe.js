/** 
 * SHIBESSS.  
*/
const axios = require('axios');
const { handleOther, handleError } = require('../../handlers/bot-embed');

module.exports = {
    name: 'shibe',
    description: 'SHIBESSS.',
    type: 'fun',
    guildOnly: true,
    cooldown: 20,
    execute(msg, args) {
        
        axios.get(`http://shibe.online/api/shibes?count=1`)
        .then(res => {

            msg.channel.send(handleOther(res.data[0], 'shibe'));

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