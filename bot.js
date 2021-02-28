const express = require('express');
var port = process.env.PORT || 8080;
const app = express();

//Heroku app
var http = require("http");
setInterval(function() {
    http.get("");
}, 300000);

app.use(express.static(__dirname + '/dist/'));
app.use('/src/assets', express.static(__dirname + '/src/assets/'));

app.listen(port);

//////////////////////////////////////////////////////////

//Import dependencies
const Discord = require('discord.js');
const fs = require('fs');

//Import modules
const StateManager = require('./state/state-manager');
const { prefix, token } = require('./config/config.json');
const { responseCheck } = require('./handlers/bot-responses');
const botEmbed = require('./handlers/bot-embed');
const { handleError } = require('./handlers/bot-embed');
const { selectStatus } = require('./helping-functions/omega-help-func');

// Create a Client instance with our bot token.
const client = new Discord.Client();
client.commands = new Discord.Collection();

//Set bot commands

const mainCommandFiles = fs.readdirSync('./commands')

for (const subDir of mainCommandFiles) {
    
    const commandFiles = fs.readdirSync(`./commands/${subDir}`).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${subDir}/${file}`);
        client.commands.set(command.name, command);
    }
}

//Client cooldowns for users
const cooldowns = new Discord.Collection();

client.login(token);

//Message handler
client.on('message', async function(msg) {

    if (!msg.content.startsWith(prefix) || msg.author.bot) {
        responseCheck(msg);
        return;
    }

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    if (!command) return;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    // Check cooldown
    if (timestamps.has(msg.author.id)) {
        const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return msg.channel.send(botEmbed.handleInfo(`${msg.author}, please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`, 'info'));
        }
    }

    // Check args
    if (command.args && !args.length) {
                                
        let reply = `You did not provide any arguments, ${msg.author}!`;

        if (command.usage) {
            reply += `\nFormat command like this:\n\`${prefix}${command.name} ${command.usage}\``
        }

        return msg.channel.send(botEmbed.handleError(reply, 'user-mistake'));
    }

    timestamps.set(msg.author.id, now);
    setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);

    // Execute the command
    try {
            
        command.execute(msg, args);
        
    } catch (e) {
        console.error(e);
        if (e instanceof Discord.DiscordAPIError) {
            msg.channel.send(handleError('I might not have correct permissions to do that.', 'user-mistake'));
        }
        msg.reply("There was an error executing that command!");
    }

});

client.on('ready', () => {

    StateManager.init(client.guilds.cache, client);
    StateManager.loadPresets();

    // Detect already punished members
    StateManager.serverList.each((guild) => {

        guild.loadMembers(client.guilds.cache.get(guild.serverId).members.cache);
    });

    console.log("\n-------------------ACTIVE SERVERS-------------------");
    StateManager.serverList.each(server => console.log(`Server name: ${server.serverName} | Server id: ${server.serverId}`))
    console.log("----------------------------------------------------\n")

    selectStatus(client);
    setInterval(() => selectStatus(client), 86400000);
    console.log("Ready and connected.");
});

client.on('guildCreate', (guild) => {

    StateManager.serverAdd(guild.id);

});

client.on("guildMemberAdd", function(member){

    StateManager.serverAvailable(member.guild.id, (oGuild) => {

        oGuild.checkMember(member);
    });

});