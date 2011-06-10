var config = exports;

config.http = {
    host: '0.0.0.0',
    port: 80
};
config.http.url = 'http://muchmala.dev' + ((config.http.port != 80) ? ":" + config.http.port : "");

config.static = {
    host: "static.muchmala.dev",
    port: 8080,
    version: 1,
    minified: false
};
config.static.url = "http://" + config.static.host + ((config.static.port != 80) ? ":" + config.static.port : ""),

config.storage = {
    type: 'file',
    file: {
        location: './webroot'
    },
    s3: {
        key:    null,
        secret: null,
        bucket: 'dev.muchmala.com'
    }
};

config.mongodb = {
    host:     '127.0.0.1',
    user:     'mongodb',
    database: 'muchmala'
};

config.queue = {
    host: "127.0.0.1",
    port: 6379,
    password: undefined,
    database: 0
};

config.cache = config.queue;

config.autenticationServices = {
    active: [],
    Twitter: {
        consumerKey:    null,
        consumerSecret: null
    },
    Facebook: {
        appId:     null,
        appSecret: null,
        callback:  config.http.url + '/auth/facebook',
        scope:     'email'
    },
    Google: {
        consumerKey:    null,
        consumerSecret: null,
        callback:       config.http.url + '/auth/google',
        scope:          ''
    },
    Yahoo: {
        consumerKey:    null,
        consumerSecret: null,
        callback:       config.http.url + '/auth/yahoo'
    }
};

config.googleAnalyticsKey = null;
config.autoRestart = false;

//@todo: remove this
config.ioServers = [
    {externalHost: 'io1.muchmala.dev', externalPort: 80, internalPort: 8082},
    {externalHost: 'io2.muchmala.dev', externalPort: 80, internalPort: 8083}
];


var localConfigPath = './config.local.js';
if (require('path').existsSync(localConfigPath)) {
    var localConfig = require(localConfigPath),
        deepExtend = require('muchmala-common').misc.deepExtend;

    deepExtend(config, localConfig);

}
