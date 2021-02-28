/** 
 * Send random word and definition from urban dictionary   
*/
const axios = require('axios');
const { handleOther, handleError } = require('../../handlers/bot-embed');

module.exports = {
    name: 'definernd',
    description: 'Returns random urban dictionary word.',
    type: 'fun',
    args: false,
    guildOnly: true,
    cooldown: 10,
    execute(msg, args) {
        
        axios.get('http://api.urbandictionary.com/v0/random')
                .then(res => {

                    if (!res.data.list[0]) {

                        return msg.channel.send(handleOther('No definition was found for this word.', 'ud-noword'));
                    }

                    let result = res.data.list[0];

                    //Clean it up a bit
                    if (result.definition.length > 2045) {
                        result.definition = result.definition.slice(0, 2045);
                        result.definition += '...';
                    }

                    if (result.example.length > 1021) {
                        result.example = result.example.slice(0, 1021);
                        result.example += '...';
                    }
                    result.definition = result.definition.replace(/\[?\]?/gi, '');
                    result.example = result.example.replace(/\[?\]?/gi, '');

                    msg.channel.send(handleOther({
                        title: result.word,
                        url: result.permalink,
                        desc: result.definition,
                        fields: {
                            name: 'Example(s):',
                            value: result.example
                        }
                    }, 'ud-define'));
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