/*
*
* Helper functions for various utilities
* 
*/

// Dependencies
const crypto = require('crypto');

// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = (str) => {
    if (typeof(str) == 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', 'thisIsASecret').update(str).digest('hex');
        return hash;
    } else {
        return false;
    }   
};

helpers.parseJsonToObject = (str) => {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

// Export the helpers
module.exports = helpers;