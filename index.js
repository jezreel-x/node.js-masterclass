const server = require('./lib/server');
const workers = require('./lib/workers');

const app = {};

// Init function
app.init = () => {
    // Start the HTTP server
    server.init();
    // Start the workers
    workers.init();
};

// Execute
app.init();


// Export the app
module.exports = app;