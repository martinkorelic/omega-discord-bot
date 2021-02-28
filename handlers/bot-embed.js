const Discord = require('discord.js');
const { prefix } = require('../config/config.json');
const { randomSth } = require('../helping-functions/randomize-func');
const OMEGA_COIN_EMOJI_ID = "<:omegacoin:755084512370622464>";

// All message prefix emoji

const errorPrefix = ':no_entry: ';
const infoPrefix = ':information_source: ';
const successPrefix = ':white_check_mark: ';

// All message embeds
const errorEmbed = new Discord.MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('Error!')

const infoEmbed = new Discord.MessageEmbed()
                    .setColor('#0198E1')
                    .setTitle('Info')

const successEmbed = new Discord.MessageEmbed()
                    .setColor('#00ff00')
                    .setTitle('Success!')
/**
 * 
 * @param {String} msgError 
 * @param {String} type
 *  Type of error
 * - 'user-mistake': User made a mistake while inputting arguments.
 * - 'missing-perm': User is missing permissions to do this action.
 * - 'internal-error': Internal error has occured.
 */
function handleError(msgError, type) {

    let desc = errorPrefix + msgError;

    switch (type) {

        case 'user-mistake':

            errorEmbed.setTitle('Incorrectly formatted command!');
            errorEmbed.setDescription(desc);

        break;

        case 'missing-perm':

            errorEmbed.setTitle('Missing permissions!');
            errorEmbed.setDescription(desc);

        break;

        case 'vc-404':

            errorEmbed.setTitle('Voice channel not found.');
            errorEmbed.setDescription(desc);

        break;

        case 'internal-error':

            errorEmbed.setTitle('Internal error.');
            errorEmbed.setDescription(desc);

        break;

        case 'api-error':

            errorEmbed.setTitle('Request error.')
            errorEmbed.setDescription('Request returned status error code `' + desc + '`.');

        break;

    }

    return errorEmbed;
}
/**
 * 
 * @param {String} msgInfo 
 * @param {String} type
 * Type of info
 * - 'info': Default info. 
 * - 'missing-set': A setting is missing.
 */
function handleInfo(msgInfo, type) {

    let desc = infoPrefix + msgInfo;

    switch (type) {

        case 'info':

            infoEmbed.setDescription(desc);
            infoEmbed.setTitle('Info');
        break;

        case 'missing-set':

            infoEmbed.setDescription(desc);
            infoEmbed.setTitle('Missing setting');
        break;

    }

    return infoEmbed;
}
/**
 * 
 * @param {String} msgSuccess 
 * @param {String} type 
 * Type of success:
 * - 'success': Successful action. 
 */
function handleSuccess(msgSuccess, type) {

    let desc = successPrefix + msgSuccess;

    switch (type) {
        
        case 'success':

            successEmbed.setDescription(desc);

        break;

    }

    return successEmbed;
}

/**
 * 
 * @param msgFields 
 * @param {String} type 
 * Type:
 * - 'ud-define': Word definition
 * - 'ud-noword': No word definiton
 * - 'help': Help single command
 * - 'help-list': List of commands
 * - 'bot-info': Info about the bot
 * - 'music-np': Now playing song info
 * - 'music-songq': Queue the requested song
 * - 'music-queue': Displays the queue
 */

function handleOther(msgFields, type) {
    
    // Other custom message embeds
    var embed = new Discord.MessageEmbed();

    switch (type) {

        case 'ud-define':

            embed.setColor('#e5e5e5');
            embed.attachFiles(['./assets/urban-dictionary-logo.gif']);
            embed.setThumbnail('attachment://urban-dictionary-logo.gif');
            embed.setTimestamp();
            embed.setTitle(msgFields.title);
            embed.setDescription(msgFields.desc);
            embed.setURL(msgFields.url);
            embed.addField(msgFields.fields.name, msgFields.fields.value);

        break;

        case 'ud-noword':

            embed.setColor('#e5e5e5');
            embed.attachFiles(['./assets/urban-dictionary-logo.gif']);
            embed.setThumbnail('attachment://urban-dictionary-logo.gif');
            embed.setTitle(msgFields);
            embed.setDescription(infoPrefix + 'Try searching some other terms.');

        break;

        case 'help':

            embed.setColor();
            embed.setTitle(msgFields.name);
            embed.setDescription(msgFields.description);
            embed.addField('**Usage:**', "`" + prefix + msgFields.name + (msgFields.usage ? " " + msgFields.usage : "") + "`");
            if (msgFields.permission) {
                let permText = '';

                for (var perm of msgFields.permission) {
                    permText += '`' + perm + '` ';
                }

                embed.addField('**Permissions:**', permText);
            }
            if (msgFields.aliases) {
                let aliaText = '';

                for (var alia of msgFields.aliases) {
                    aliaText += '`' + alia + '` ';
                }

                embed.addField('**Aliases:**', aliaText);
            }
            if (msgFields.cooldown) {
                embed.addField('**Cooldown:**', msgFields.cooldown + " second(s)");
            }
            

        break;

        case 'help-list':
            embed.setColor()
            embed.setTitle('❔ OMEGA HELP ❔')

            for (var field in msgFields) {
                embed.addField(field.charAt(0).toUpperCase() + field.slice(1), msgFields[field]);
            }

        break;

        case 'bot-info':

            embed.setColor('#fefefe');
            embed.setTitle('Ω OMEGA INFO Ω');
            embed.setDescription('Version: ' + msgFields.version + '\nAuthor: ' + msgFields.author);

        break;

        case 'music-np':

            let minutesNp = (msgFields.length/60).toFixed(0);
            let secondsNp = (msgFields.length%60).toFixed(0);

            embed.setColor('#fefefe');
            embed.setTitle('Now playing:');
            embed.setDescription(`**${msgFields.title}**\n\`${msgFields.author}\``);
            embed.setThumbnail(msgFields.thumbnail);
            embed.addField('Length', `\`[${msgFields.currentTime} - ${(secondsNp == 60 ? (minutesNp+1) + ":00" : (minutesNp < 10 ? "0" : "") + minutesNp + ":" + (secondsNp < 10 ? "0" : "") + secondsNp)}]\``);
            embed.addField('Requested by', `\`${msgFields.requestedBy}\``);
            embed.setURL(msgFields.url);
        
        break;

        case 'music-songq':

            let minutes = (msgFields.length/60).toFixed(0);
            let seconds = (msgFields.length%60).toFixed(0);
            
            embed.setColor('#fefefe');
            embed.setTitle('Song was queued.');
            embed.setDescription(`**${msgFields.title}**\n\`${msgFields.author}\``);
            embed.setThumbnail(msgFields.thumbnail);
            embed.addField('Length', `\`[${msgFields.currentTime} - ${(seconds == 60 ? (minutes+1) + ":00" : (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds)}]\``);
            embed.addField('Requested by', `\`${msgFields.requestedBy}\``);
            embed.addField('Queue:', `Position #${msgFields.queue}`);
            embed.setURL(msgFields.url);

        break;

        case 'music-queue':

            embed.setColor('#fefefe');
            embed.setDescription(`**[Current Song: ${msgFields[0].title}](${msgFields[0].url})**\n${msgFields.info}`);

        break;

        case 'game-roulette-start':

            embed.setColor('#32a846');
            embed.setAuthor('💎 OMEGA ROULETTE 💎');
            embed.setTitle('🎲 Win amazing or lose OMEGALUL 🤑');
            embed.addField('You have 30 seconds to place your bets','Good luck.');
            embed.setDescription("Use the command `joing {amount} {red/black/green or number (0-36)}`");
            embed.attachFiles(['./assets/roulette-pic.jpg']);
            embed.setImage('attachment://roulette-pic.jpg');
            embed.setTimestamp();

        break;
            
        case 'game-roulette-bet':

            let colourBet = '';

            switch (msgFields.colour) {

                case 'red':
                    colourBet = '#ff2200';
                break;

                case 'green':
                    colourBet = '#00ff40';
                break;

                case 'black':
                    colourBet = '#000000';
                break;

                default:
                    colourBet = '#fefefe';
                break;
            
            }
            embed.setColor(colourBet);
            embed.setTitle('Bet was added.');
            embed.setDescription(`<@${msgFields.author}> has placed a bet of ${msgFields.amount} ${OMEGA_COIN_EMOJI_ID} on \`${colourBet == '#fefefe' ? msgFields.number : msgFields.colour}\`.`);

        break;

        case 'game-roulette-end':
            
            let title = '';
            let embedColour = '';
            let fields = [];
            
            //Title display
            switch (msgFields[0].colour) {
                case 'red':
                title = msgFields[0].number + ' ' + msgFields[0].colour + '  🟥 !'
                embedColour = '#ff2200';
                break;

                case 'black':
                title = msgFields[0].number + ' ' + msgFields[0].colour + '  ⬛ !'
                embedColour = '#000000';
                break;

                case 'green':
                title = msgFields[0].number + ' ' + msgFields[0].colour + '  🟩 !'
                embedColour = '#00ff40';
                break;
            }

            msgFields[1].sort((a, b) => b.balance-a.balance);

            let x = 0

            for (let res of msgFields[1]) {
                if (x == 3)
                    break;

                fields.push({
                    name: res.balance > 0 ? 'WINNER!' : 'LOSER! OMEGALUL',
                    value:  + res.balance > 0 ? '<@' + res.userId + '> has won '+ res.balance + ' ' + OMEGA_COIN_EMOJI_ID : '<@' + res.userId + '> has lost ' + res.balance + ' ' + OMEGA_COIN_EMOJI_ID
                })

                x++;
            }

            embed.setColor(embedColour);
            embed.setAuthor('💎 OMEGA ROULETTE 💎');
            embed.setTitle('The ball landed on #' + title);
            embed.setDescription('Here are your top winners and losers:');
            embed.addFields(fields);
            embed.setTimestamp();

        break;

        case 'balance-info':

            embed.setColor('#fefefe');
            embed.setTitle(`${OMEGA_COIN_EMOJI_ID} OMEGA BALANCE ${OMEGA_COIN_EMOJI_ID}`);
            embed.setDescription(`<@${msgFields.author}> your current balance is ${msgFields.balance.toLocaleString()} ${OMEGA_COIN_EMOJI_ID}.`);

        break;

        case 'balance-giff':

            embed.setColor('#fefefe');
            embed.setTitle(`${OMEGA_COIN_EMOJI_ID} OMEGA DAILY ${OMEGA_COIN_EMOJI_ID}`);
            embed.setDescription(`<@${msgFields.author}>\n${msgFields.res}\nNext daily will be available in 4 hours.`);

        break;

        case 'balance-give':

            embed.setColor('#fefefe');
            embed.setTitle(`${OMEGA_COIN_EMOJI_ID} OMEGA GIFT ${OMEGA_COIN_EMOJI_ID}`);
            embed.setDescription(msgFields);

        break;

        case 'balance-top':

            let rankStringBalance = '';
                        
            msgFields.forEach(function(user) {
                if (user.index == 1) {
                    rankStringBalance += '👑 **' + user.index + '.** ' + user.username + ' (' + user.balance.toLocaleString() + ' ' + OMEGA_COIN_EMOJI_ID + ')\n';
                } else if (user.index == 2) {
                    rankStringBalance += '💍 **' + user.index + '.** ' + user.username + ' (' + user.balance.toLocaleString() + ' ' + OMEGA_COIN_EMOJI_ID + ')\n';
                } else if (user.index == 3) {
                    rankStringBalance += '💰 **' + user.index + '.** ' + user.username + ' (' + user.balance.toLocaleString() + ' ' + OMEGA_COIN_EMOJI_ID + ')\n';
                } else {
                    rankStringBalance += '🔹 **' + user.index + '.** ' + user.username + ' (' + user.balance.toLocaleString() + ' ' + OMEGA_COIN_EMOJI_ID + ')\n';
                }
            });

            embed.setColor('#fefefe');
            embed.setAuthor('💎 OMEGACOINS LEADERBOARD 💎');
            embed.setDescription(rankStringBalance);
            embed.setTimestamp();

        break;

        case 'store-list':

            embed.setColor("#f2f2f2");
            embed.setAuthor("💰 OMEGA STORE 💰");
            embed.setDescription(msgFields);
            embed.setTimestamp();

        break;

        case 'store-buy':

            embed.setColor("#f2f2f2");
            embed.setAuthor("💰 OMEGA STORE 💰");
            embed.setDescription(msgFields);

        break;

        case 'inv-list':

            embed.setColor("#f2f2f2");
            embed.setTitle(msgFields.author + "'s inventory:");
            embed.setDescription(msgFields.res);
            embed.setTimestamp();

        break;

        case 'omega-watch':

            embed.setColor('#ff0000');
            embed.setTitle('👀 OmegaWatch™ 👀');
            embed.setDescription(msgFields);
            embed.setTimestamp();

        break;

        case 'dream':
            
            embed.setAuthor(`${msgFields.author} is dreaming about ${msgFields.keyword.charAt(0).toUpperCase() + msgFields.keyword.slice(1)}. 💭`, msgFields.avatar);
            embed.setImage(msgFields.url);
            
        break;

        case 'dream-rnd':

            embed.setAuthor(`${msgFields.author} is dreaming about this... 💭`, msgFields.avatar);
            embed.setImage(msgFields.url);

        break;

        case 'shibe':

            embed.setColor('#ff8000');
            embed.setTitle('SHIBESS');
            embed.setImage(msgFields);

        break;

        
        case 'insult':

            embed.setColor('#8b0000');
            embed.setDescription(msgFields);

        break;

        case 'game-trivia-start':
            
            embed.setColor('#228B22');

            embed.setAuthor('⁉ OMEGA TRIVIA ⁉');
            embed.setTitle(msgFields.question + ' (' + msgFields.difficulty + ')');
            embed.setFooter('Category: ' + msgFields.category);
            embed.addField('You have 30 seconds to answer.', 'Good luck.');
            
            let aString = '**Use `!joing <number>` to answer the question.**\n';
            let aIndex = 1;

            for (var a in msgFields.answers) {
                aString += `🔹 (${aIndex}) ${msgFields.answers[a]} \n`;
                aIndex++;
            }
            
            embed.setDescription(aString);

        break;

        case 'game-trivia-answer':

            embed.setColor('#228B22');
            embed.setAuthor(`${msgFields.author} answered.`, msgFields.avatar);
            embed.setDescription(`${msgFields.author} has chosen \`${msgFields.answerChosen}\`.`);

        break;

        case 'game-trivia-end':

            embed.setAuthor('⁉ OMEGA TRIVIA ⁉');
            embed.setColor('#228B22');
            embed.setTitle('And the correct answer was...');
            embed.setDescription(`\`${msgFields.answer}\``);

            if (msgFields.users.length == 0) {
                embed.addField('No one answered correctly.', 'Dumbasses.');
            } else {
                embed.addField('Users who answered correctly:', msgFields.users.join('\n'));
            }
            
        break;

        case 'pin-info':

            embed.setColor('#0099ff')
            embed.setTitle('Pinned message')
            embed.setThumbnail(msgFields.avatar)
            embed.addField("Message by:", "<@" + msgFields.author + ">")

        break;

        case 'kiss':

            embed.setColor('#ffc0cb');
            embed.setAuthor(`😳 ${msgFields.author} just kissed ${msgFields.mentionedMember}! 😳`, msgFields.avatar);
            embed.setImage(randomSth('kiss'));

        break;

        case 'simp':

            embed.setColor('#7f0000');
            embed.setAuthor(`😳 ${msgFields.mentionedMember} was caught simping! 😳`, msgFields.avatar);
            embed.setImage(randomSth('simp'));

        break;

        case '8ball':

            embed.setTitle('🎱 OMEGA 8ball says 🎱');
            embed.setDescription(randomSth('8ball'));
            embed.setColor('#fefefe');

        break;
    }

    return embed;
}

module.exports = {
    handleError,
    handleInfo,
    handleSuccess,
    handleOther
}