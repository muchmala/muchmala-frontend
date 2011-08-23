var Frontend = require('./frontend');

var config = require('../config');
module.exports = Frontend.createFrontendServer(config);
