const { handleError, handleOther } = require("../handlers/bot-embed");
const botGames = require("../handlers/bot-games");
const axios = require('axios');

class OmegaGameManager {

    constructor() {

        this.currentGame = null;
        this.gameActive = false;

    }

    async startGame(msg, type) {

        if (!this.gameActive) {

            this.checkAndPlay(msg, type);

        } else {
            return msg.channel.send(handleError('Game is already active!', 'user-mistake'));
        }

    }

    async checkAndPlay(msg, type) {
        var startGameData = null;
        var endGameData = null;

        switch (type) {

            case 'cock':

                this.currentGame = new botGames.CockyS;

            break;

            case 'roulette':

                this.currentGame = new botGames.Roulette;

            break;

            case 'trivia':

                const questionData = await axios.get('https://opentdb.com/api.php?amount=1');
                
                if (!questionData.data || questionData.data.response_code !== 0) {

                    return msg.channel.send(handleError('Looks like the question did not arrive! Try again later...','internal-error'));
                }

                this.currentGame = new botGames.Trivia;
                startGameData = questionData.data.results[0];
                
            break;

        }

        if (this.currentGame) {

            this.gameActive = true;
            
            endGameData = await this.currentGame.startGame(msg, startGameData);

            if (!endGameData) {
                msg.channel.send(handleError('Internal error has occured.','internal-error'))
            }

            if (this.currentGame instanceof botGames.CockyS) {
                
                msg.channel.send(handleOther(endGameData, 'game-cocky-end'));
            } else if (this.currentGame instanceof botGames.Roulette) {

                msg.channel.send(handleOther(endGameData, 'game-roulette-end'));
            } else if (this.currentGame instanceof botGames.Trivia) {

                msg.channel.send(handleOther(endGameData, 'game-trivia-end'));
            }

            this.gameActive = false;
            this.currentGame = null;

        } else {
            return msg.channel.send(handleError('Game does not exist!', 'user-mistake'));
        }

    }


}

module.exports = {
    OmegaGameManager
}