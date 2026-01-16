// importing necessary modules

const { stat } = require('fs');
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

// creating a server
const server = http.createServer((req, res) => {

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
        handler({ normalizedPath, method, pathname, queryParams, payload: buffer }, (statusCode, payload) => {
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
});

// server listening on port 3000
server.listen(config.port, () => {
    console.log(`Server is listening on port ${config.port} in ${config.envName} mode`);
});


// Define handlers
const handlers = {};

// Sample handler
handlers.sample = (data, callback) => {
    callback(200, { message: 'This is a sample handler' });
};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
};

// Define a request router
const router = {
    'sample' : handlers.sample
};