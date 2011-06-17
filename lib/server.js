var opts = require('opts'),
    express = require('express'),
    auth = require('connect-auth'),
    form = require('connect-form'),
    RedisStore = require('connect-redis'),

    common = require('muchmala-common'),
    db = common.db,
    controllers = require('./controllers'),
    formStrategy = require('./controllers/formAuthStrategy'),

    config = require('../config');

var queue = new common.queueAdapter(config.queue);
var server = express.createServer();

opts.parse([
{
    'short': 'p',
    'long': 'port',
    'description': 'HTTP port',
    'value': true,
    'required': false
}
], true);

var port = opts.get('port') || config.http.port;

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

function getAuthServices(options) {
    var services = [], service;

    for (var i = options.active.length; i--; ) {
        service = options.active[i];

        services.push(auth[service](options[service]));
    }

    services.push(formStrategy());
    return services;
}

/*var validatePasswordFunction = function(username, password, successCallback, failureCallback){
    if (username === 'foo' && password === "bar"){
        successCallback();
    } else {
        failureCallback();
    }
};*/

server.listen(port, config.http.host);
server._queue = queue;

controllers(server);