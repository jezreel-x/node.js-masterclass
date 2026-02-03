/*
* Request Handlers
*
*/

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define handlers
const handlers = {};

// Users handler

// delegates data to the appropriate submethod stored in `handlers._users`
handlers.users = (data, callback) => {
    // Handle users related requests
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {

        // Call the corresponding method for users
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
    // Logic for creating a user
    // Check that all required fields are filled out
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesn't already exist
        // (Implementation of user creation goes here)
        _data.read('users', phone, (err, data) => {
            if (err) {
                // User does not exist, create new user
                // hash the password
                const hashedPassword = helpers.hash(password);

                // confirm hashed password
                if (hashedPassword) {
                    // create the user object
                    const userObject = {
                        firstName,
                        lastName,
                        phone,
                        hashedPassword,
                        tosAgreement: true
                    };

                    // Store the user
                    _data.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not create the new user' });
                        }
                    });
                } else {
                    callback(500, { 'Error': 'Could not hash the user\'s password.' });
                }
                
            } else {
                // User already exists
                callback(400, { 'Error': 'A user with that phone number already exists' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields' });
    }
};


// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = (data, callback) => {
    // Logic for getting a user
    // Check that the phone number is valid
    const phone = typeof(data.queryParams.phone) == 'string' && data.queryParams.phone.trim().length == 10 ? data.queryParams.phone.trim() : false;
    if (phone) {

        // Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Verify the token
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Get the user data
                _data.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        // Remove the hashed password from the response before returning it
                        delete userData.hashedPassword;
                        callback(200, userData);
                    } else {
                        callback(404, { 'Error': 'User not found' });
                    }
                });
            } else {
                callback(400, { 'Error': 'Missing required token in header, or token is invalid' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field: phone number' });
    }
};


// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
handlers._users.put = (data, callback) => {
    // Logic for updating a user
    // Check for the required field
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    // Check for the optional fields
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Error if the phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {

            // Get the token from the headers
            const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

            // Verify the token
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    // Lookup the user
                    _data.read('users', phone, (err, userData) => {
                        if (!err && userData) {
                            // Update the fields if necessary
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.hashedPassword = helpers.hash(password);
                            }

                            // Update the user data in the file
                            _data.update('users', phone, userData, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, { 'Error': 'Could not update the user' });
                                }
                            });
                        } else {
                            callback(404, { 'Error': 'User not found' });
                        }
                    });
                } else {
                    callback(400, { 'Error': 'Missing required token in header, or token is invalid' });
                }   
            });
        } else {
            callback(400, { 'Error': 'Missing required fields to update' });
        }
    } else {
        callback(400, { 'Error': 'Missing required field: phone number' });
    }
};


// Users - delete
// Required data: phone
handlers._users.delete = (data, callback) => {
    // Logic for getting a user
    // Check that the phone number is valid
    const phone = typeof(data.queryParams.phone) == 'string' && data.queryParams.phone.trim().length == 10 ? data.queryParams.phone.trim() : false;

    if (phone) {
        // Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Verify the token
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // lookup that user using a specified phone number
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        _data.delete("users", phone, (err, data) => {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, { 'Error' : 'Could not delete specified user!!' })
                            }
                        })
                    } else {
                        callback(500, { 'Error' : 'User could not be found!!' })
                    }
                });
            } else {
                callback(400, { 'Error': 'Missing required token in header, or token is invalid' });
            }
        });
    } else {
        callback(404, { 'Error' : 'Missing required field: phone number' })
    }
};



// Tokens handler
handlers.tokens = (data, callback) => {
    // Handle tokens related requests
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        // Call the corresponding method for tokens
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the tokens submethods
handlers._tokens = {};


// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
    // Logic for creating a token
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone && password) {
        // Lookup the user using that phone
        _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
                // Hash the sent password and compare it to the password stored in the user object
                const hashedPassword = helpers.hash(password);
                if (hashedPassword === userData.hashedPassword) {
                    // If valid, create a new token with a random name. Set expiration date 1 hour in the future
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;

                    // create a human-readable date for expiration
                    const formattedDate = (expires) => {
                        const d = new Date(expires);
                        const date = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
                        const time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                        return `${date} ${time}`;
                    };

                    const tokenObject = {
                        phone,
                        id: tokenId,
                        expires : formattedDate(expires)
                    };
                    // Store the token
                    _data.create('tokens', tokenId, tokenObject, (err) => {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, { 'Error' : 'Could not create the new token' })
                        }
                    });
                } else {
                    callback(400, { 'Error' : 'Password did not match the specified user\'s stored password' })
                }
            } else {
                callback(400, { 'Error' : 'Could not find the specified user' })
            }
        });

    } else {
        callback(400, {'Error' : 'Missing required field(s)'})
    };
};


// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = (data, callback) => {
    // Logic for getting a token
    // Check that the id is valid
    const id = typeof(data.queryParams.id) == 'string' && data.queryParams.id.trim().length == 20 ? data.queryParams.id.trim() : false;

    if (id) {
        // Lookup the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404, { 'Error' : 'Token not found' });
            }
        });
    } else {
        callback(400, { 'Error' : 'Missing required field: id' });
    }
};



// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
    // Logic for updating a token
    const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    const extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if (id && extend) {
        // Lookup the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // Check to make sure the token isn't already expired
                const currentTime = Date.now(); // get current time in milliseconds
                const tokenExpiryTime = new Date(tokenData.expires).getTime();
                if (tokenExpiryTime > currentTime) {
                    // Set the expiration an hour from now
                    const newExpires = currentTime + 1000 * 60 * 60;
                    tokenData.expires = new Date(newExpires).toString();

                    // Store the new updates
                    _data.update('tokens', id, tokenData, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, { 'Error' : 'Could not update the token\'s expiration' });
                        }
                    });
                } else {
                    callback(400, { 'Error' : 'The token has already expired and cannot be extended' });
                }
            } else {
                callback(404, { 'Error' : 'Specified token does not exist' });
            }   
        });
    } else {
        callback(400, { 'Error' : 'Missing required field(s) or field(s) are invalid' });
    }
};


// Tokens - delete
// Required data: id
handlers._tokens.delete = (data, callback) => {
    // Logic for deleting a token
    // Check that the id is valid
    const id = typeof(data.queryParams.id) == 'string' && data.queryParams.id.trim().length == 20 ? data.queryParams.id.trim() : false;

    if (id) {
        // Lookup the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // Delete the token
                _data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, { 'Error' : 'Could not delete the specified token' });
                    }
                });
            } else {
                callback(404, { 'Error' : 'Token not found' });
            }
        });
    } else {
        callback(400, { 'Error' : 'Missing required field: id' });
    }
};



// Token verification method
handlers._tokens.verifyToken = (id, phone, callback) => {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            // Check that the token is for the given user and has not expired
            const currentTime = Date.now(); // get current time in milliseconds
            const tokenExpiryTime = new Date(tokenData.expires).getTime();

            if (tokenData.phone == phone && tokenExpiryTime > currentTime) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// Ping handler
handlers.ping = (data, callback) => {
    callback(200);
};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
};

// Export the handlers
module.exports = handlers;