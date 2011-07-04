var fs = require('fs');
var config = require('../../config');
var ioCluster = require('socket.io-cluster');

module.exports = function(server) {
    var frontendServer = ioCluster.makeFrontendServer(server, {IO_SERVERS: config.ioServers});

    // this doesn't work yet
    // server._queue.subscribe('servers', function(server) {
    //     if (server.type = 'io') {
    //         frontendServer.addIoServer(server.interface);
    //     }
    // })

    var viewConfig = {
        staticUrl:          config.static.url,
        version:            config.getStaticVersion(),
        minified:           config.static.minified,
        googleAnalyticsKey: config.googleAnalyticsKey
    };

    console.log('Static Version:', viewConfig.version);

    server.get('/', function(req, res) {
        res.render('puzzle', {
            config: viewConfig,
            loggedin: req.isAuthenticated(),
            socketIoServers: JSON.stringify(frontendServer.getIoServersList())
        });
    });
};