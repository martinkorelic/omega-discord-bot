const botPG = require('./bot-postgres');

function responseCheck(msg) {

    let content = msg.content;

    for (var pattern in possibleResponses) {

        //There is a match
        if (possibleResponses[pattern].test(content)) {

            switch (pattern) {

                // Good bot thank
                case 'goodBot':

                return;
            }

        }
    }
}

module.exports = {
    responseCheck
}