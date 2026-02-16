/* 
* Library for storing and rotating logs
*
*/

// Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib'); // For compressing the log files
const _data = require('./data'); 


// Container for the logs
const _logs = {};


// Base directory of the logs folder
_logs.baseDir = path.join(__dirname, '/../.logs/');


// Append a string to a file. Create the file if it does not exist
_logs.append = function(file, str, callback) {
    // Open the file for appending
    fs.open(_logs.baseDir + file + '.log', 'a', function(err, fileDescriptor) {
        if (!err && fileDescriptor) {
            // Append to the file and close it
            fs.appendFile(fileDescriptor, str + '\n', function(err) {
                if (!err) {
                    fs.close(fileDescriptor, function(err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing file that was being appended');
                        }
                    });
                } else {
                    callback('Error appending to file');
                }
            });
        } else {
            callback('Could not open file for appending');
        }
    });
};


// List all the logs, and optionally include the compressed logs
_logs.list = function(includeCompressedLogs, callback) {
    fs.readdir(_logs.baseDir, function(err, data) {
        if (!err && data && data.length > 0) {
            var trimmedFileNames = [];
            data.forEach(function(fileName) {
                // Add the .log files
                if (fileName.indexOf('.log') > -1) {
                    trimmedFileNames.push(fileName.replace('.log', ''));
                }
                // Add the .gz files
                if (includeCompressedLogs && fileName.indexOf('.gz.b64') > -1) {
                    trimmedFileNames.push(fileName.replace('.gz.b64', ''));
                }
            });
            callback(false, trimmedFileNames);
        } else {
            callback(err, data);
        }
    });
};


// Compress the contents of one .log file into a .gz.b64 file within the same directory
_logs.compress = function(logId, newFileId, callback) {
    var sourceFile = logId + '.log';
    var destFile = newFileId + '.gz.b64';

    // Read the source file
    fs.readFile(_logs.baseDir + sourceFile, 'utf8', function(err, inputString) {
        if (!err && inputString) {
            // Compress the data using gzip
            zlib.gzip(inputString, function(err, compressedBuffer) {
                if (!err && compressedBuffer) {
                    // Send the compressed data to the destination file
                    fs.open(_logs.baseDir + destFile, 'wx', function(err, fileDescriptor) {
                        if (!err && fileDescriptor) {
                            // Write to the destination file
                            fs.writeFile(fileDescriptor, compressedBuffer.toString('base64'), function(err) {
                                if (!err) {
                                    // Close the destination file
                                    fs.close(fileDescriptor, function(err) {
                                        if (!err) {
                                            callback(false);
                                        } else {
                                            callback('Error closing the new compressed file');
                                        }
                                    });
                                } else {
                                    callback('Error writing to the new compressed file');
                                }
                            });
                        } else {
                            callback('Could not open the new file for writing');
                        }
                    });
                } else {
                    callback('Error compressing file contents');
                }
            });
        } else {
            callback('Error reading source file');
        }
    });
};


// Decompress the contents of a .gz.b64 file into a string variable
_logs.decompress = function(fileId, callback) {
    var fileName = fileId + '.gz.b64';
    fs.readFile(_logs.baseDir + fileName, 'utf8', function(err, str) {
        if (!err && str) {
            // Decompress the data
            var inputBuffer = Buffer.from(str, 'base64');
            zlib.unzip(inputBuffer, function(err, outputBuffer) {
                if (!err && outputBuffer) {
                    // Callback with the decompressed string
                    var str = outputBuffer.toString();
                    callback(false, str);
                } else {
                    callback('Error decompressing file');
                }
            });
        } else {
            callback('Error reading the compressed file');
        }
    });
};


// Truncate a log file
_logs.truncate = function(logId, callback) {
    fs.truncate(_logs.baseDir + logId + '.log', 0, function(err) {
        if (!err) {
            callback(false); // Success
        } else {
            callback('Error truncating file');
        }
    });
};


// Export the module
module.exports = _logs;