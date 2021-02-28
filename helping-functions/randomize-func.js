// All items

const itemsStatus = [
    {
        name: "with manly stuff",
        type: "PLAYING"
    },
    {
        name: "Michael Jackson",
        type: "LISTENING"
    },
    {
        name: "over students",
        type: "WATCHING"
    },
    {
        name: "lofi hiphop beats to study/relax to",
        type: "LISTENING"
    },
    {
        name: "depressing songs",
        type: "LISTENING"
    },
    {
        name: "with friends :)",
        type: "PLAYING"
    },
    {
        name: "you",
        type: "WATCHING"
    },
    {
        name: "over myself",
        type: "WATCHING"
    },
    {
        name: "your back",
        type: "WATCHING"
    },
    {
        name: "with myself",
        type: "PLAYING"
    },
    {
        name: "other people",
        type: "WATCHING"
    }
]

const itemsKissGifs = [
    'https://media1.tenor.com/images/896f0159d6605b27c59ef3c3f818d664/tenor.gif?itemid=16490903',
    'https://media1.tenor.com/images/7776e71416f695e25623fbbdf762e1b0/tenor.gif?itemid=6239983',
    'https://media1.tenor.com/images/d3171a065afb2fdbb340a81294b2f698/tenor.gif?itemid=15854801',
    'https://media1.tenor.com/images/ef9687b36e36605b375b4e9b0cde51db/tenor.gif?itemid=12498627',
    'https://media1.tenor.com/images/86f33e746a36056e09462459b690df65/tenor.gif?itemid=18409324',
    'https://media1.tenor.com/images/2cef2bb1185493a6d2f723b3d04bd299/tenor.gif?itemid=12650614',
    'https://media1.tenor.com/images/1d133ea3c2d71bcffbf79e3665a65983/tenor.gif?itemid=13519864',
    'https://media1.tenor.com/images/5f1670480080b0b3a6b8cbd557b97727/tenor.gif?itemid=15572524',
    'https://media1.tenor.com/images/78095c007974aceb72b91aeb7ee54a71/tenor.gif?itemid=5095865'
]

const simpGifs = [
    'https://media1.tenor.com/images/56e501115001ac5c07e61333cda80ecf/tenor.gif?itemid=8555510',
    'https://media1.tenor.com/images/b5cfc5d13e8640543a528c5da6412e8e/tenor.gif?itemid=17092288',
    'https://media1.tenor.com/images/85517f6e25bd05ea3c03292ea5ef3789/tenor.gif?itemid=15954006',
    'https://media1.tenor.com/images/f01e0942829235086c2770ffa9f29874/tenor.gif?itemid=17087416',
    'https://media1.tenor.com/images/8d4f83e587dc867bf2e6bfe56abfcc66/tenor.gif?itemid=16283123',
    'https://thumbs.gfycat.com/AcceptableParallelDromaeosaur-max-1mb.gif',
    'https://37.media.tumblr.com/tumblr_lf81ndzlTU1qc4debo1_500.gif',
    'https://media1.tenor.com/images/d15c7d011be4e6320083ecbe8473dbbd/tenor.gif?itemid=17852144',
    'https://media1.tenor.com/images/77c2ab01e5c0b7fc1cce8e789dfff965/tenor.gif?itemid=18136223',
    'https://media1.tenor.com/images/fee96c10a4f6449825c4a9f15e507fa6/tenor.gif?itemid=16617987'
]

const magic8ball = [
    'I don\'t know. Ask the person below.',
    'YES.',
    '100% yes!',
    'Probably.',
    'Depends on the situation.',
    'Ask the mods.',
    'I have no clue.',
    'That\'s a no from me.',
    'AAAAAAAAAAAAAAAAAAAAAAAAA',
    'I am depressed. I don\'t know. :(',
    'NO.',
    'Please for the love of god no.',
    'Hell no.',
    'Hell yeah.',
    'Ask someone else.',
    'Perhaps.',
    'I am a god.',
    'Love you <3 and yes.',
    'It may happen.',
    'It will happen someday.',
    'Try again.',
    'I believe in you.',
    'You won\'t make it.',
    'It won\'t happen. Sorry buddy.'
]

/**
 * A function that returns a random item.
 * @param type
 * - 'status': return a random status
 * - 'kiss': return a random kiss gif url
 * - 'simp': return a random simp gif url
 * - '8ball': return a random 8ball response
 */
function randomSth(type) {

    var items = [];

    switch (type) {

        case 'status':

            items = itemsStatus;

        break;

        case 'kiss':

            items = itemsKissGifs;

        break;

        case 'simp':

            items = simpGifs;

        break;

        case '8ball':

            items = magic8ball;

        break;

    }

    return items[Math.floor(Math.random()*items.length)];
}

module.exports = {
    randomSth
}