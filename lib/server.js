// importing necessary modules

require('dotenv').config();

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const _data = require('./data');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('../config');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require('util');
const { type } = require('os');
const debug = util.debuglog('server');

// Instantiate the server module object
const server = {};

// Testing the data module
// _data.create('test', 'newFile', { foo: 'bar' }, (err) => {
//     if (!err) {
//         console.log('File created successfully');
//     } else {
//         console.log('Error creating file:', err);
//     }
// });


// _data.read('test', 'newFile', (err, data) => {
//     if (!err && data) {
//         const parsedData = JSON.parse(data);
//         console.log('File data:', parsedData);
//     } else {
//         console.log('Error reading file:', err);
//     }
// });

// _data.update('test', 'newFile', { foo: 'baz' }, (err) => {
//     if (!err) {
//         console.log('File updated successfully');
//     } else {
//         console.log('Error updating file:', err);
//     }
// });

// _data.delete('test', 'newFile', (err) => {
//     if (!err) {
//         console.log('File deleted successfully');
//     } else {
//         console.log(err);
//     }
// });

// helpers.sendTwilioSms('1234567890', 'Hello from Node.js!', (err) => {
//     if (!err) {
//         console.log('SMS sent successfully');
//     } else {
//         console.log('Error sending SMS:', err);
//     }
// });

// creating a http server
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res);
});

// create a https server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

// unified server logic for both http and https server
server.unifiedServer = (req, res) => {
    // parsing the request URL
    const parsedUrl = url.parse(req.url, true);  // the second argument 'true' tells url.parse to parse the query string into an object

    // access pathname
    const pathname = parsedUrl.pathname;

    // replace multiple slashes and trim leading/trailing slashes
    const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');

    // access query parameters
    const queryParams = parsedUrl.query; // this will be an object containing the query parameters

    // access the HTTP method
    const method = req.method.toLowerCase();

    // access the headers
    const headers = req.headers;

    // accessing the payload (if any)
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end(); // finalize the buffer

        // call the appropriate handler
        var handler = server.router[normalizedPath] || handlers.notFound;

        // If the request is within the public directory use the public handler instead
        handler = normalizedPath.indexOf('public/') > -1 ? handlers.public : handler;   

        handler({ normalizedPath, method, pathname, headers, queryParams, payload: helpers.parseJsonToObject(buffer) }, (statusCode, payload, contentType) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 200;
            contentType = typeof contentType === 'string' ? contentType : 'json';

            // Return the response parts that are content specific
            let payloadString = '';
            if (contentType === 'json') {
                res.setHeader('Content-Type', 'application/json');
                payload = typeof payload === 'object' ? payload : {};
                payloadString = JSON.stringify(payload);
            } else if (contentType === 'javascript') {
                res.setHeader('Content-Type', 'application/javascript');
                payloadString = typeof payload !== 'undefined' ? payload : '';
            } else if (contentType === 'html') {
                res.setHeader('Content-Type', 'text/html');
                payloadString = typeof payload === 'string' ? payload : '...';
            } else if (contentType === 'favicon') {
                res.setHeader('Content-Type', 'image/x-icon');
                payloadString = payload;
            } else if (contentType === 'css') {
                res.setHeader('Content-Type', 'text/css');
                payloadString = typeof payload !== 'undefined' ? payload : '';
            } else if (contentType === 'png') {
                res.setHeader('Content-Type', 'image/png');
                payloadString = payload;
            } else if (contentType === 'jpg') {
                res.setHeader('Content-Type', 'image/jpeg');
                payloadString = payload;
            }  else {
                res.setHeader('Content-Type', 'text/plain');
                payloadString = payload;
            }   

            // Return the response parts that are common to all content types
            res.writeHead(statusCode);
            res.end(payloadString);

            // If the response is 200, print green, otherwise print red
            if (statusCode === 200) {
                debug('\x1b[32m%s\x1b[0m', `${method.toUpperCase()} /${normalizedPath} ${statusCode}`);
            } else {
                debug('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${normalizedPath} ${statusCode}`);
            }           
        });
    });

    // // send response
    // res.writeHead(200, { 'Content-Type': 'text/plain' });
    // res.end(`Normalized Path: ${normalizedPath}\nMethod: ${method}\n`);

    // console.log('Query Parameters:', queryParams);
};

// Define a request router
server.router = {
    // 'sample' : handlers.sample
    '' : handlers.index,
    'account/create' : handlers.accountCreate,
    'account/edit' : handlers.accountEdit,
    'account/deleted' : handlers.accountDeleted,
    'session/create' : handlers.sessionCreate,
    'session/deleted' : handlers.sessionDeleted,
    'checks/all' : handlers.checksList,
    'checks/create' : handlers.checksCreate,
    'checks/edit' : handlers.checksEdit,
    'ping' : handlers.ping,
    'api/users' : handlers.users,
    'api/tokens' : handlers.tokens,
    'api/checks' : handlers.checks,
    'favicon.ico' : handlers.favicon,
    'public' : handlers.public
};

// Init a script
server.init = () => {
    // Start the HTTP server
    server.httpServer.listen(config.httpPort, () => {
        console.log(`\x1b[35m%s\x1b[0m`, `HTTP Server is listening on port ${config.httpPort} in ${config.envName} mode`);
    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, () => {
        console.log(`\x1b[36m%s\x1b[0m`, `HTTPS Server is listening on port ${config.httpsPort} in ${config.envName} mode`);
    });
};

// Export the server
module.exports = server;