// create a simple `Hello World` API that returns a welcome message in JSON format
// The API should respond to GET requests at the path `/hello`
// The response should be a JSON object with a message property containing the welcome message

// Using the built-in HTTP module to create the server
const http = require('http');
const PORT = 3002;

const server = http.createServer((req, res) => {
    // Only respond to GET requests at the path /hello
    if (req.method === 'GET' && req.url === '/hello') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Welcome to NodeJS Masterclass' }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});