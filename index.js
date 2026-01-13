// importing necessary modules

const http = require('http');
const url = require('url');

// creating a server
const server = http.createServer((req, res) => {

    // parsing the request URL
    const parsedUrl = url.parse(req.url, true);

    // access pathname
    const pathname = parsedUrl.pathname;

    // replace multiple slashes
    const normalizedPath = pathname.replace(/\/+/g, '');

    // access the HTTP method
    const method = req.method.toLowerCase();

    // send response
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Normalized Path: ${normalizedPath}\nMethod: ${method}\n`);
});

// server listening on port 3000
server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});