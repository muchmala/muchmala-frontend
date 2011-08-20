var fs = require('fs');
var config = require('../../config');

module.exports = function(server) {
    var viewConfig = {
        ioUrl:              config.io.url,
        ioHost:             config.io.host,
        staticUrl:          config.static.url,
        version:            config.getStaticVersion(),
        minified:           config.static.minified,
        googleAnalyticsKey: config.googleAnalyticsKey
    };

    console.log('Static Version:', viewConfig.version);

    server.get('/', function(req, res) {
        res.render('puzzle', {
            config: viewConfig,
            loggedin: req.isAuthenticated()
        });
    });
};