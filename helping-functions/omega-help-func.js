const { randomSth } = require('./randomize-func');

/**
 * Check if one role is higher than the other.
 * if role1 higher than role2 - returns `true`
 * if role2 higher or equal than role1 - return `false`
 * @param role1 - first role
 * @param role2 - second role
 */
function checkRoles(role1, role2) {

    let role1Highest = 0;

    if (role1.position) {
        
        role1Highest = role1.position;

    } else {

        role1Highest = getHighestPosition(role1);

    }

    let role2Highest = 0;

    if (role2.position) {

        role2Highest = role2.position;

    } else {

        role2Highest = getHighestPosition(role2);

    }

    if (role1Highest > role2Highest) {

        return true;
    }

    return false;
}

/**
 * Get highest of the roles.
 * @param roles - all the roles that the user has.
 */
function getHighestPosition(roles) {

    roles = roles.map((role) => role.position).sort((a, b) => b - a);

    return roles[0];
}

/**
 * 
 * @param {Array} array - array to be shuffled
 */

function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}

/**
 * Cleans text
 * @param {String} text - text to be cleaned
 */
function cleanText(text) {

    return text.replace(/\&#039;/g, '').replace(/\&quot;/g, '').replace(/\&amp;/g, '');
}

/**
 * Selects a status
 */
function selectStatus(client) {
    let status = randomSth('status');

    client.user.setActivity(status.name, { type: status.type});
}

module.exports = {
    checkRoles,
    getHighestPosition,
    shuffleArray,
    cleanText,
    selectStatus
}