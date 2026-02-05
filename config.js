// Creating and exporting configuration variables

// Container for all the environments
const environments = {};

// Staging (default) environment
environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'staging',
    maxChecks: 5,
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromPhone: process.env.TWILIO_FROM_PHONE
    }
};

// Production environment
environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production',
    maxChecks: 5
};

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not, default to staging
const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

// debug lines
// console.log("DEBUG - Current env var:", currentEnvironment);
// console.log("DEBUG - Looking for:", environments[currentEnvironment]);
// console.log("DEBUG - Environment to export:", environmentToExport.envName);
// console.log("DEBUG - Available environments:", Object.keys(environments));
// console.log("DEBUG - environments object:", environments);

// Export the module
module.exports = environmentToExport;