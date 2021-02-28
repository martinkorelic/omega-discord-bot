// Used for playing bot games
const botPG = require("./bot-postgres");
const rouletteFields = require("../assets/roulette-field.json");
const { handleOther } = require("./bot-embed");
const { shuffleArray, cleanText } = require('../helping-functions/omega-help-func');

class Game {

    constructor(gameName) {
        this.joinedUsers = [];
        this.name = gameName;
    }

    startGame(time) {
        
        var self = this;
        return new Promise(function(resolve, reject) {
            setTimeout(() => resolve(self.endGame()), time);
        });
    }

    addUser(userId) {
        if (!this.joinedUsers.includes(userId)) {
            this.joinedUsers.push(userId);
            
            return true;
        }
        return false;
    }

    endGame() {
        throw new Error("Method endGame() must be implemented.");
    }
}

class Roulette extends Game {

    constructor() {
        super('Roulette');
        
        this.userBets = [];
        this.fields = rouletteFields;

    }

    startGame(msg) {
        msg.channel.send(handleOther('','game-roulette-start'));
        return super.startGame(30000);
    }

    async addUser(userId, amount, number, colour) {

        var enoughBalance = await botPG.balanceCheck(userId, amount);
        if (super.addUser(userId) && enoughBalance[0]) {
            this.userBets.push({
                userId: userId,
                amount: amount,
                colour: colour,
                number: number
            })
            return true;
        }
        return false;
    }

    async endGame() {
        //Randomize win
        var winningField = this.fields[Math.floor(Math.random()*this.fields.length)];

        var winnings = this.calculateWinnings(winningField);
        //process winnings
        await botPG.processWinnings(winnings);

        //Return text of everybody that got money

        return [winningField, winnings];
    }

    calculateWinnings(winningField) {
        //Randomize and take/give money and send data to db
        var queryFieldsToChange = [];

        this.userBets.forEach(function(user) {
            //Check if user got the right colour and number
            if (user.number == winningField.number) {
                queryFieldsToChange.push({
                    userId: user.userId,
                    balance: user.amount * 35 - user.amount
                })
            } //Check if user got the right colour
            else if (user.colour == winningField.colour) {

                //User got a green!
                if (winningField.colour == 'green' && user.colour == 'green') {
                    queryFieldsToChange.push({
                        userId: user.userId,
                        balance: user.amount * 35 - user.amount
                    })
                } //User got red or black
                else {
                    queryFieldsToChange.push({
                        userId: user.userId,
                        balance: user.amount
                    })
                }

            } //User lost all their bets 
            else {
                queryFieldsToChange.push({
                    userId: user.userId,
                    balance: -user.amount
                })
            }
        });

        return queryFieldsToChange;
    }
}

class Trivia extends Game {

    constructor() {
        super('Trivia');

        this.userAnswers = [];

        this.answers = [];
        this.correctAnswerIndex = 0;
    }

    startGame(msg, questionData) {


        if (questionData.type == 'multiple') {
            questionData.incorrect_answers.push(questionData.correct_answer);

            var shuffled = shuffleArray(questionData.incorrect_answers);

            for (var answer of shuffled) {
                this.answers.push(cleanText(answer));
            }

        } else if (questionData.type == 'boolean') {

            this.answers = ['True', 'False'];

        } else {
            return;
        }
        
        this.correctAnswerIndex = this.answers.findIndex(q => q == questionData.correct_answer) + 1;
        
        msg.channel.send(handleOther({
            answers: this.answers,
            question: cleanText(questionData.question),
            category: questionData.category,
            difficulty: questionData.difficulty,
        },'game-trivia-start'));

        return super.startGame(30000);
    }

    addUser(userId, userName, answer) {
        
        if (super.addUser(userId)) {
            this.userAnswers.push({
                username: userName,
                answer: answer
            })
            return true;
        }
        return false;
    }

    endGame() {

        let correctUserAnswers = [];

        for (var uAnswer of this.userAnswers) {
            
            if (uAnswer.answer == this.correctAnswerIndex) {
                correctUserAnswers.push(uAnswer.username);
            }
        }
        
        return { users: correctUserAnswers, answer: this.answers[this.correctAnswerIndex-1] };
    }

}   

module.exports = {
    Roulette: Roulette,
    Trivia: Trivia
}