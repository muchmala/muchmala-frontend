var express = require('express'),
    auth = require('connect-auth'),
    form = require('connect-form'),
    RedisStore = require('connect-redis'),

    common = require('muchmala-common'),
    db = common.db,
    controllers = require('./controllers'),
    formStrategy = require('./controllers/formAuthStrategy');



exports.createFrontendServer = function(config) {
    var queue = new common.queueAdapter(config.queue);
    var server = express.createServer();

    db.connect(config.mongodb, function() {});

    server.set('view engine', 'html');
    server.set('views', __dirname + '/views');
    server.register('.html', require('ejs'));

    server.use(form());
    server.use(express.cookieParser());
    server.use(express.session({
        secret: 'secret',
        store: new RedisStore(),
        cookie: {httpOnly: false}
    }));

    server.use(
        auth(getAuthServices(config.autenticationServices))
    );

    server._queue = queue;

    controllers(server);

    return server;
};



function getAuthServices(options) {
    var services = [], service;

    for (var i = options.active.length; i--; ) {
        service = options.active[i];

        services.push(auth[service](options[service]));
    }

    services.push(formStrategy());
    return services;
}
