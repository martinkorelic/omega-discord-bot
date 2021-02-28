// Used for handling postgres queries
const moment = require('moment');
const { Pool } = require('pg');
const botStore = require('./bot-store');
const db = require('../config/config.json');

//TODO add || process.env.DATABASE_URL
const connectionString = db.db_con;
const OMEGA_COIN_EMOJI_ID = "<:omegacoin:755084512370622464>";

//Create a Postgres client
const pgClient = new Pool ({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false}
});

pgClient.connect();

/**
 * TRIGGER: - when roulette ends and winnings need to be processed
 */
async function processWinnings(rouletteWinnings) {

    rouletteWinnings.forEach(async function(bet) {
        await pgClient.query("UPDATE balance SET balance = balance + $1 WHERE userid = $2", [bet.balance, bet.userId]);
    });

    return new Promise(function(resolve, reject) {
        resolve();
    })
}

/**
 * COMMAND: - !giff
 */
//TODO fix this shit to do timezones
async function giffCoins(authorID, authorUsername, isBooster) {

    var datenowObj = moment().utc();
    var datenow = moment().format("YYYY-MM-DD HH:mm");

    var res = await pgClient.query("SELECT * FROM balance WHERE userid = $1", [authorID]);

    let amount = 500;

    let randomBonus = Math.floor(Math.random() * 11);
    let randomBonusAmount = Math.floor(Math.random() * 500);

    if (isBooster) {
        amount += 1500;
    }
    if (randomBonus < 5) {
        amount += randomBonusAmount;
    }

    if (res.rows.length == 0) {

        pgClient.query("insert into balance(userid, username, lastrequest, balance) values ($1, $2, to_timestamp($3,'YYYY-MM-DD HH24:mi') , $4)", [authorID, authorUsername, datenow, 1000])
        return [true, "Your balance is 1000 " + OMEGA_COIN_EMOJI_ID];
    }

    var balance = res.rows[0].balance;
    var lastRequest = moment(res.rows[0].lastrequest);
    var differenceHours = moment.duration(datenowObj.diff(moment(lastRequest)));

    if (differenceHours.asHours() < 4) {
        return [false, "You need to wait atleast **" + (3 - parseInt(differenceHours.asHours())) + " hours and " + (59 - parseInt(differenceHours.asMinutes())%60) + " minutes** before requesting more OmegaCoins " + OMEGA_COIN_EMOJI_ID + "."];
    } else {
        pgClient.query("UPDATE balance SET lastrequest = to_timestamp($1,'YYYY-MM-DD HH24:mi'), balance = balance + $2, username = $3 WHERE userid = $4", [datenow, amount, authorUsername, authorID])
    }

    return [true,"+ 500 " + OMEGA_COIN_EMOJI_ID + " was added to your balance.\n" + 
    (isBooster ? "+ 1500 " + OMEGA_COIN_EMOJI_ID + " (server boosting)\n" : "") +
    (randomBonus < 5 ? "+ " + randomBonusAmount + " " + OMEGA_COIN_EMOJI_ID + " (random bonus)\n" : "") +
    "Making it a total of " + amount + " " + OMEGA_COIN_EMOJI_ID + ".\nYour new balance is " + (balance + amount).toLocaleString() + " " + OMEGA_COIN_EMOJI_ID + "."];
}

/**
 * COMMAND: - !balance
 * @param request - check how much did the user request
 * @param authorID - requested author id
 */
async function balanceCheck(authorID, request=0) {

    var accept = false;

    var res = await pgClient.query("SELECT * FROM balance WHERE userid = $1", [authorID]);

    //User does not exist yet
    if (res.rows.length == 0) {

        return [accept, -1]

    } else if (request !== 0 && request <= res.rows[0].balance) {
        accept = true;
    }
    
    return [accept, res.rows[0].balance];
}

/**
 * COMMAND: - !balance top
 */
async function topBalances() {

    var res = await pgClient.query("SELECT * FROM balance ORDER BY balance DESC LIMIT 10");

    let balanceData = [];

    let i = 1;
    res.rows.forEach(el => {

        balanceData.push({
            index: i,
            username: el.username,
            balance: el.balance
        });

        i++;
    });

    return balanceData;
}

/**
 * COMMAND: - !buyItem {name}
 * @param itemId - item that user requested to buy
 */
async function itemHandler(authorID, authorUsername, type, itemRequest) {

    var item = botStore.store.findItemByName(itemRequest);

    if (!item) {

        return 'Item you requested does not exist.';
    }

    //Check if user exists first
    var res = await pgClient.query("SELECT * from inventory WHERE userid = $1", [authorID]);

    if (res.rows.length == 0) {

        return 'User does not exist! Type `!inv` first to initialize your inventory.';
    }


    if (type == 'buy') {
        var check = await balanceCheck(authorID, item.price);

        //Item exists (user can buy) and has enough balance
        if (check[0] && item) {

            //"{shortname} {amount}"
            var infoAmount = '';
            var infoName = '';

            var index = res.rows[0].userinventory.findIndex(function(pgItem) {
                var itemInfo = pgItem.split("/");

                infoName = itemInfo[0];
                infoAmount = itemInfo[1];

                return infoName == item.shortName;
            });

            let stringItem = '';
            if (index === -1) {

                stringItem = item.shortName + "/1";
            } else {
                //Increase amount
                infoAmount++;
                stringItem = infoName + "/" + infoAmount;
            }
            
            try {
                //Buy item
                if (index == -1) {
                    await pgClient.query("UPDATE balance SET balance = balance - $1, username = $2 WHERE userid = $3", [item.price, authorUsername, authorID]);
                    await pgClient.query("UPDATE inventory SET userinventory = userinventory || ARRAY[$1], username = $2 WHERE userid = $3", [stringItem, authorUsername, authorID]);
                } else {
                    await pgClient.query("UPDATE balance SET balance = balance - $1, username = $2 WHERE userid = $3", [item.price, authorUsername, authorID]);
                    await pgClient.query("UPDATE inventory SET userinventory = array_replace(userinventory, $1, $2), username = $3 WHERE userid = $4", [res.rows[0].userinventory[index], stringItem, authorUsername, authorID]);
                }
                

            } catch(e) {
                console.log(e);
                return "Internal error has occured.";
            }
            
            return "<@" + authorID + "> has successfully bought:\n" + item.emoji + " " + item.name + ".";
        } else if (!check[0] && check[1] == -1) {

            return 'User does not exist! Type `!inv` and `!giff` first to initialize your inventory and balance.';
        } 

        return "<@" + authorID + "> you don't have enough OmegaCoins to purchase this item.";
    }
    
}

/**
 * COMMAND: - !inventory
 */
async function viewInventory(authorID, authorUsername) {

    var res = await pgClient.query("SELECT * FROM inventory WHERE userid = $1", [authorID]);

    // User does not exist, create new inventory
    if (res.rows.length == 0) {

        pgClient.query("insert into inventory(userid, username, userinventory) values ($1, $2, '{}')", [authorID, authorUsername])

        return [false , "<@" + authorID + "> your inventory is now available."];
    } // Display user's inventory
    else {

        var responseMsg = botStore.store.itemsToString(res.rows[0].userinventory);

        return [true, responseMsg];
    }

}

/**
 * COMMAND: - !give
 */

async function giveCoinsTo(amount, authorID, requestUserID) {

    var res = await pgClient.query("SELECT * FROM balance WHERE userid = $1", [authorID]);

    //User does not exist
    if (res.rows.length == 0) {
        return "User does not exist.";
    } 
    
    var check = await balanceCheck(authorID, amount);
    //User does not have enough balance
    if (!check[0]) {
        return "You don't have enough balance to do this.";
    }

    try {
        await pgClient.query("UPDATE balance SET balance = balance + $1 WHERE userid = $2", [amount, requestUserID]);
        await pgClient.query("UPDATE balance SET balance = balance - $1 WHERE userid = $2", [amount, authorID]);
    } catch (e) {
        console.log(e);
        return "The transaction did not go through.";
    }
    
    return "<@" + authorID + "> just gifted <@" + requestUserID + "> " + amount.toLocaleString() + " " + OMEGA_COIN_EMOJI_ID + ".";
}

module.exports = {
    giffCoins,
    balanceCheck,
    processWinnings,
    topBalances,
    itemHandler,
    viewInventory,
    giveCoinsTo
}