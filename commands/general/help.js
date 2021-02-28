const { handleOther, handleError } = require('../../handlers/bot-embed');
/**
 * Display all available commands
 */

const StateManager = require('../../state/state-manager');

module.exports = {
    name: 'help',
    description: 'Displays all available commands.',
    type: 'general',
    usage: '<command name>',
    guildOnly: true,
    cooldown: 2,
    execute(msg, args) {

        if (args.length != 0) {

            const command = StateManager.client.commands.get(args[0]) || StateManager.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));
    
            if (!command) {

                return msg.channel.send(handleError('Command does not exist!', 'user-mistake'));
            } 

            return msg.channel.send(handleOther(command, 'help'));
        }

        let helpFields = {};

        StateManager.client.commands.each((command) => {

            if (!helpFields[command.type]) {
                helpFields[command.type] = '`' + command.name + '`';
            } else {
                helpFields[command.type] += ' `' + command.name + '`';
            }

        });
        return msg.channel.send(handleOther(helpFields, 'help-list'));        
    }
}