// importing necessary modules

require('dotenv').config();

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const _data = require('./lib/data');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');


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

// creating a http server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

// http server listening on HTTP port
httpServer.listen(config.httpPort, () => {
    console.log(`Server is listening on port ${config.httpPort} in ${config.envName} mode`);
});


// create a https server
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

// https server listening on HTTPS port
httpsServer.listen(config.httpsPort, () => {
    console.log(`HTTPS Server is listening on port ${config.httpsPort} in ${config.envName} mode`);
});


// unified server logic for both http and https server
const unifiedServer = (req, res) => {
    // parsing the request URL
    const parsedUrl = url.parse(req.url, true);

    // access pathname
    const pathname = parsedUrl.pathname;

    // replace multiple slashes
    const normalizedPath = pathname.replace(/\/+/g, '');

    // access query parameters
    const queryParams = parsedUrl.query;

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
        buffer += decoder.end();

        // call the appropriate handler
        const handler = router[normalizedPath] || handlers.notFound;
        handler({ normalizedPath, method, pathname, headers, queryParams, payload: helpers.parseJsonToObject(buffer) }, (statusCode, payload) => {
            payload = typeof payload === 'object' ? payload : {};
            statusCode = typeof statusCode === 'number' ? statusCode : 200;

            const payloadString = JSON.stringify(payload);

            // return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // log the payload
            console.log(`Returning this response: ${statusCode} - ${payloadString}`);
        });
    });

    // // send response
    // res.writeHead(200, { 'Content-Type': 'text/plain' });
    // res.end(`Normalized Path: ${normalizedPath}\nMethod: ${method}\n`);

    // console.log('Query Parameters:', queryParams);
};

// Define a request router
const router = {
    // 'sample' : handlers.sample
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens,
    'checks' : handlers.checks
};