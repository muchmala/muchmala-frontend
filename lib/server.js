var opts = require('opts');
var express = require('express');
var auth = require('connect-auth');
var form = require('connect-form');
var RedisStore = require('connect-redis');

var db = require('muchmala-common').db;
var controllers = require('./controllers');
var formStrategy = require('./controllers/formAuthStrategy');

var config = require('../config');

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

controllers(server);