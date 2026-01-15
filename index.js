// importing necessary modules

const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

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
        // log the payload
        console.log('Payload:', buffer);
    });

    // send response
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Normalized Path: ${normalizedPath}\nMethod: ${method}\n`);

    console.log('Query Parameters:', queryParams);
});

// server listening on port 3000
server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});