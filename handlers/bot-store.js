// Module for handling store
const storeItems = require("../assets/store-items.json");
const OMEGA_COIN_EMOJI_ID = "<:omegacoin:755084512370622464>";

var store = {
    items: storeItems,
    findItemById: (itemRequest) => {
        let index = store.items.findIndex((item) => item.id == itemRequest);
        return store.items[index];
    },
    findItemByName: (itemRequest) => {
        let index = store.items.findIndex((item) => item.shortName == itemRequest);
        return store.items[index];
    },
    itemsToString: (itemList) => {
        
        if (!itemList) {
            return 'Your inventory is empty.'
        }

        itemList = itemList.sort();
        
        let msgString = 'Here is your current inventory:\n\n';

        for (var item of itemList) {
            
            let infoItem = item.split("/");

            let xItem = store.findItemByName(infoItem[0]);
            msgString += xItem.emoji + ' ' + xItem.name + ' (x' + infoItem[1] + ')\n';
            
        }

        return msgString;

    },
    listAllItems: () => {
        let msgString = '';

        for (var item of store.items) {

            msgString += item.emoji + ' ' + item.name + ' (' + item.price.toLocaleString() + ' '+ OMEGA_COIN_EMOJI_ID + ') - Use `!buy ' + item.shortName + '` \n\n';

        }

        return msgString;
    }
}

module.exports = {
    store
}