const ytdl = require('ytdl-core');
const { handleError, handleInfo, handleOther } = require("../handlers/bot-embed");
const presetPlaylist = require('../assets/playlists.json');

class OmegaMusicManager {

    constructor() {

        this.activeVC = false;
        this.currentVC = null;
        this.playQueue = [];
        this.loop = false;
        this.dispatcher = null;
        this.vcChannelId = '';
        this.textChannelId = '';
        this.msgOn = true;

    }

    checkUserInVC(msg) {

        return msg.member.voice.channel ? true : false;
    }

    checkUserInCorrectVC(msg) {
        
        return msg.member.voice.channel.id == this.vcChannelId ? true : false;
    }

    async joinVC(msg) {

        if (!this.checkUserInVC(msg)) {
            msg.channel.send(handleError('User is not connected to a voice channel!', 'vc-404'));
            return false;
        }

        var connection = await msg.member.voice.channel.join();

        msg.channel.send(handleInfo(`Connected to \`${msg.member.voice.channel.name}\` and binded to \`${msg.channel.name}\`.`, 'info'));
        this.currentVC = connection;
        this.activeVC = true;
        this.vcChannelId = msg.member.voice.channel.id;
        this.textChannelId = msg.channel.id;

        return true;
    }

    async checkAndPlay(msg, link, displayMsg) {

        // Check if not in VC
        if (!this.activeVC) {

            let isUserInVC = await this.joinVC(msg);

            if (!isUserInVC) return;

        } else if (!this.checkUserInVC(msg)) {

            return msg.channel.send(handleError('User is not connected to a voice channel!', 'vc-404'));
        } else if (!this.checkUserInCorrectVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to the right voice channel!', 'vc-404'));
        }

        // Reached max playlist

        if (this.playQueue.length > 40) {

            if (displayMsg) {

                return msg.channel.send(handleError('Queue has reached max amount of songs. No more than \`40\` songs.', 'user-mistake'));
            } 
            return;
        }

        link = link.replace(/&(.*)/gi, '');

        let songAlreadyInQueue = false;

        this.playQueue.forEach((song) => {

            if (song.url == link) {
                songAlreadyInQueue = true;
                return;
            }

        });
        // Song already in queue
        if (songAlreadyInQueue) {

            if (displayMsg) {
                return msg.channel.send(handleInfo('Song is already in queue.', 'info'));
            }
            return;
        }

        // Validate url
        let validUrl = ytdl.validateURL(link);

        if (!validUrl) {

            return msg.channel.send(handleError('Youtube link is not correct.', 'user-mistake'));
        }

        // Check if queue empty
        var info = await ytdl.getBasicInfo(link);

        if (info.videoDetails.lengthSeconds > 7200) {

            return msg.channel.send(handleInfo('I will not play songs longer than \`2 hours\`! 😡', 'info'));
        }

        let videoInfo = {
            author: info.videoDetails.author.name,
            length: info.videoDetails.lengthSeconds,
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnail.thumbnails[3].url,
            requestedBy: msg.author.username,
            url: link,
            currentTime: '00:00'
        }

        if (!this.dispatcher) {

            this.playQueue.push(videoInfo);

            msg.channel.send(handleOther(videoInfo, 'music-np'));
            
            return this.playSong(msg, videoInfo.url);
        }
        
        this.playQueue.push(videoInfo);
        if (displayMsg) {
            msg.channel.send(handleOther({...videoInfo, queue: this.playQueue.length }, 'music-songq'));
        }        
    }

    async playSong(msg, link) {

        var requestedLink = await ytdl(link, { filter: 'audioonly', highWaterMark: 1 << 25 });

        this.dispatcher = this.currentVC.play(requestedLink);

        var self = this;
        this.dispatcher.on("finish", function() {
            if (!self.activeVC) return;
            
            var shiffed = self.playQueue.shift();
            
            if (self.playQueue.length == 0 && !self.loop) {
                self.dispatcher = null;

                setTimeout(() => {
                    self.autoDC(msg);
                }, 300000);

                return;
            }

            if (self.loop) {
                
                self.playQueue.push(shiffed);
            }

            self.playSong(msg, self.playQueue[0].url);

            if (self.msgOn) {
                
                msg.channel.send(handleOther(self.playQueue[0], 'music-np'));
            }
        });
    }

    skipSong(msg) {

        if (!this.activeVC) {

            return msg.channel.send(handleError('I am not connected to a VC.', 'user-mistake'));
        } else if (!this.dispatcher) {

            return msg.channel.send(handleError('Nothing is playing currently.', 'user-mistake'));
        } else if (!this.checkUserInVC(msg)) {

            return msg.channel.send(handleError('User is not connected to a voice channel!', 'vc-404'));
        } else if (!this.checkUserInCorrectVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to the right voice channel!', 'vc-404'));
        }

        this.dispatcher.end();
        return msg.guild.channels.cache.get(this.textChannelId).send(handleInfo('Song was skipped. ⏭', 'info'));
    }

    skipTo(msg, index) {

        if (!this.activeVC) {

            return msg.channel.send(handleError('I am not connected to a VC.', 'user-mistake'));
        } else if (!this.dispatcher) {

            return msg.channel.send(handleError('Nothing is playing currently.', 'user-mistake'));
        } else if (!this.checkUserInVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to a voice channel!', 'vc-404'));
        } else if (!this.checkUserInCorrectVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to the right voice channel!', 'vc-404'));
        }

        if (index > 1 && index <= this.playQueue.length) {

            for (var i = 0; i<index-1; i++) {

                let removedSong = this.playQueue.shift();

                if (this.loop) {
                    this.playQueue.push(removedSong);
                }    
            }
            if (this.msgOn) {
                this.nowPlaying(msg);
            }
            this.playSong(msg, this.playQueue[0].url);
            return msg.guild.channels.cache.get(this.textChannelId).send(handleInfo(`Skipped to song \`${this.playQueue[0].title}\`.`, 'info'));
        } 

        return msg.guild.channels.cache.get(this.textChannelId).send(handleError(`Index does not exist! Input a value up to \`${this.playQueue.length}\`.`, 'user-mistake'));

    }

    pauseSong(msg) {

        if (!this.activeVC) {

            return msg.channel.send(handleError('I am not connected to a VC.', 'user-mistake'));
        } else if (!this.dispatcher) {

            return msg.channel.send(handleError('Nothing is playing currently.', 'user-mistake'));
        } else if (!this.checkUserInVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to a voice channel!', 'vc-404'));
        } else if (!this.checkUserInCorrectVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to the right voice channel!', 'vc-404'));
        }
        
        this.dispatcher.pause();
        return msg.guild.channels.cache.get(this.textChannelId).send(handleInfo('Pausing... ⏸', 'info'));
    }

    resumeSong(msg) {

        if (!this.activeVC) {

            return msg.channel.send(handleError('I am not connected to a VC.', 'user-mistake'));
        } else if (!this.dispatcher) {

            return msg.channel.send(handleError('Nothing is playing currently.', 'user-mistake'));
        } else if (!this.checkUserInVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to a voice channel!', 'vc-404'));
        } else if (!this.checkUserInCorrectVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to the right voice channel!', 'vc-404'));
        }

        this.dispatcher.resume();
        return msg.guild.channels.cache.get(this.textChannelId).send(handleInfo('Resuming... ▶', 'info'));
    }

    setVolume(msg, value) {

        if (!this.activeVC) {

            return msg.channel.send(handleError('I am not connected to a VC.', 'user-mistake'));
        } else if (!this.dispatcher) {

            return msg.channel.send(handleError('Nothing is playing currently.', 'user-mistake'));
        } else if (!this.checkUserInVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to a voice channel!', 'vc-404'));
        } else if (!this.checkUserInCorrectVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to the right voice channel!', 'vc-404'));
        }
        
        this.dispatcher.setVolume(value);
        msg.guild.channels.cache.get(this.textChannelId).send(handleInfo(`Volume is set to \`${value}\`.`, 'info'));
    }

    disconnectVC(msg) {

        if (!this.activeVC) {

            return msg.channel.send(handleError('I am not connected to a VC.', 'user-mistake'));
        } else if (!this.checkUserInVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to a voice channel!', 'vc-404'));
        } else if (!this.checkUserInCorrectVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to the right voice channel!', 'vc-404'));
        }

        let text = this.textChannelId;

        this.activeVC = false;
        this.currentVC.disconnect();
        this.currentVC = null;
        this.textChannelId = '';
        this.vcChannelId = '';
        this.playQueue = [];
        this.dispatcher = null;
        return msg.guild.channels.cache.get(text).send(handleInfo(`Disconnecting from VC. Requested by \`${msg.author.username}\`. Bye! 👋`, 'info'));
    }

    setLoop(msg) {

        if (!this.activeVC) {

            return msg.channel.send(handleError('I am not connected to a VC.', 'user-mistake'));
        } else if (!this.dispatcher) {

            return msg.channel.send(handleError('Nothing is playing currently.', 'user-mistake'));
        } else if (!this.checkUserInVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to a voice channel!', 'vc-404'));
        } else if (!this.checkUserInCorrectVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to the right voice channel!', 'vc-404'));
        }
        
        this.loop = !this.loop;
        msg.guild.channels.cache.get(this.textChannelId).send(handleInfo(`Looping is now **${this.loop ? 'enabled':'disabled'}** 🔁.\nUse the command \`npmsg\` to toggle now playing messages.`, 'info'));
    }
    
    async getSongQueue(msg) {

        if (!this.activeVC) {

            return msg.channel.send(handleError('I am not connected to a VC.', 'user-mistake'));
        } else if (!this.dispatcher) {

            return msg.channel.send(handleError('Nothing is playing currently.', 'user-mistake'));
        }

        let currentPage = 0;
        var embeds = this.generateQueueEmbed();
        const queueEmbed = await msg.channel.send(`Current Page: ${currentPage+1}/${embeds.length}`, embeds[currentPage]);
        await queueEmbed.react('◀');
        await queueEmbed.react('▶');

        const filter = (reaction, user) => ['◀','▶'].includes(reaction.emoji.name) && (msg.author.id == user.id);

        const collector = queueEmbed.createReactionCollector(filter);

        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name === '▶') {
                if (currentPage < embeds.length-1) {
                    currentPage++;
                    queueEmbed.edit(`Current Page: ${currentPage+1}/${embeds.length}`, embeds[currentPage]);
                } 
            } else if (reaction.emoji.name === '◀') {
                if (currentPage !== 0) {
                    --currentPage;
                    queueEmbed.edit(`Current Page: ${currentPage+1}/${embeds.length}`, embeds[currentPage]);
                }
            }
        });

        setTimeout(() => {
            collector.stop();
        },60000);

    }

    generateQueueEmbed() {
        const embeds = [];
        let k = 10;

        for (let i = 0; i < this.playQueue.length; i += 10) {
            const current = this.playQueue.slice(i, k);
            let j = i;
            k += 10;
            const info = current.map(track => `${++j}) [${track.title}](${track.url}) (Requested by: \`${track.requestedBy}\`)`).join('\n');
            const embed = handleOther({...this.playQueue, info: info},'music-queue');
            embeds.push(embed);
        }

        return embeds;
    }

    removeSong(msg, index) {

        if (!this.activeVC) {

            return msg.channel.send(handleError('I am not connected to a VC.', 'user-mistake'));
        } else if (!this.dispatcher) {

            return msg.channel.send(handleError('Nothing is playing currently.', 'user-mistake'));
        } else if (!this.checkUserInVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to a voice channel!', 'vc-404'));
        } else if (!this.checkUserInCorrectVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to the right voice channel!', 'vc-404'));
        }

        if (index > 0 && index <= this.playQueue.length) {
            let removedSong = this.playQueue.pop(index-1);
            
            if (index == 1) {
                this.skipSong(msg);
            }
            
            return msg.guild.channels.cache.get(this.textChannelId).send(handleInfo(`Song \`${removedSong.title}\` was removed by \`${msg.author.username}\`.`, 'info'));
        } 

        return msg.guild.channels.cache.get(this.textChannelId).send(handleError(`Index does not exist! Input a value up to \`${this.playQueue.length}\`.`, 'user-mistake'));
    }

    nowPlaying(msg) {

        if (!this.activeVC) {

            return msg.channel.send(handleError('I am not connected to a VC.', 'user-mistake'));
        } else if (!this.dispatcher) {

            return msg.channel.send(handleError('Nothing is playing currently.', 'user-mistake'));
        }

        let seconds = ((this.dispatcher.streamTime % 60000) / 1000).toFixed(0);
        let minutes = Math.floor(this.dispatcher.streamTime / 60000);
        
        return msg.guild.channels.cache.get(this.textChannelId).send(handleOther({...this.playQueue[0], currentTime: (seconds == 60 ? (minutes+1) + ":00" : (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds)}, 'music-np'));
    }

    autoDC(msg) {
        
        if (!this.dispatcher) {
            let channel = msg.guild.channels.cache.get(this.textChannelId);
            channel.send(handleInfo(`Disconnecting from \`${msg.guild.channels.cache.get(this.vcChannelId).name}\` due to inactivity.`, 'info'));
            this.currentVC.disconnect();
        }
        
    }

    setNpMsg(msg) {
        if (!this.activeVC) {

            return msg.channel.send(handleError('I am not connected to a VC.', 'user-mistake'));
        }
        this.msgOn = !this.msgOn;
        msg.guild.channels.cache.get(this.textChannelId).send(handleInfo(`Now playing messages are now **${this.msgOn ? 'enabled':'disabled'}**.`, 'info'));
    }

    loadPlaylist(msg, playlistName) {

        if (!this.activeVC) {

            return msg.channel.send(handleError('I am not connected to a VC.', 'user-mistake'));
        } else if (!this.checkUserInVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to a voice channel!', 'vc-404'));
        } else if (!this.checkUserInCorrectVC(msg)) {
            
            return msg.channel.send(handleError('User is not connected to the right voice channel!', 'vc-404'));
        }

        let playlist = presetPlaylist[playlistName];
        
        if (playlist) {

            for (var song of playlist) {
                
                
                this.checkAndPlay(msg, song, false);
            }

            return msg.channel.send(handleInfo(`Adding songs from \`${playlistName}\` to the queue.`, 'info'));
        }
        
        return msg.channel.send(handleError(`Playlist ${playlistName} does not exist.`, 'user-mistake')); 
    }

}

module.exports = {
    OmegaMusicManager
}