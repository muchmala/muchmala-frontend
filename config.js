var config = exports;

config.http = {
    host: process.env.MUCHMALA_FE_HTTP_HOST || '0.0.0.0',
    port: process.env.MUCHMALA_FE_HTTP_PORT || 80
};
config.http.url = process.env.MUCHMALA_FE_URL || 'http://muchmala.dev';

if (process.env.MUCHMALA_FE_IO_SERVERS) {
    config.ioServers = process.env.MUCHMALA_FE_IO_SERVERS.split(',');
    for (var k in config.ioServers) {
        var v = config.ioServers[k];
        var parts = v.split(':');
        if (parts.length === 1) {
            parts[1] = 80;
        }
        config.ioServers[k] = {
            externalHost: parts[0],
            externalPort: parts[1]
        };
    }
} else {
    config.ioServers = [{
        externalHost: 'io.muchmala.dev',
        externalPort: 80
    }];
}

config.static = {
    host: process.env.MUCHMALA_FE_STATIC_HOST || "static.muchmala.dev",
    port: process.env.MUCHMALA_FE_STATIC_PORT || 8080,
    version: process.env.MUCHMALA_FE_STATIC_VERSION || 1,
    minified: process.env.MUCHMALA_FE_STATIC_MINIFIED || false
};
config.static.url = process.env.MUCHMALA_FE_STATIC_URL ||
    "http://" + config.static.host + ((config.static.port != 80) ? ":" + config.static.port : ""),

config.storage = {
    type: process.env.MUCHMALA_FE_STORAGE_TYPE || 'file',
    file: {
        location: process.env.MUCHMALA_FE_STORAGE_FILE_LOCATION || './webroot'
    },
    s3: {
        key:    process.env.MUCHMALA_FE_STORAGE_S3_KEY || null,
        secret: process.env.MUCHMALA_FE_STORAGE_S3_SECRET || null,
        bucket: process.env.MUCHMALA_FE_STORAGE_S3_BUCKET || 'dev.muchmala.com'
    }
};

config.mongodb = {
    host:     process.env.MUCHMALA_MONGODB_HOST || '127.0.0.1',
    user:     process.env.MUCHMALA_MONGODB_USER || 'mongodb',
    database: process.env.MUCHMALA_MONGODB_DATABASE || 'muchmala'
};

config.queue = {
    host: process.env.MUCHMALA_QUEUE_HOST || "127.0.0.1",
    port: process.env.MUCHMALA_QUEUE_PORT || 6379,
    password: process.env.MUCHMALA_QUEUE_PASSWORD || undefined,
    database: process.env.MUCHMALA_QUEUE_DATABASE || 0
};

config.cache = config.queue;

config.autenticationServices = {
    active: process.env.MUCHMALA_AUTH_SERVICES && process.env.MUCHMALA_AUTH_SERVICES.split(',') || '',
    Twitter: {
        consumerKey:    process.env.MUCHMALA_AUTH_TWITTER_KEY || null,
        consumerSecret: process.env.MUCHMALA_AUTH_TWITTER_SECRET || null
    },
    Facebook: {
        appId:     process.env.MUCHMALA_AUTH_FACEBOOK_APPID || null,
        appSecret: process.env.MUCHMALA_AUTH_FACEBOOK_SECRET || null,
        callback:  process.env.MUCHMALA_AUTH_FACEBOOK_CALLBACK || config.http.url + '/auth/facebook',
        scope:     process.env.MUCHMALA_AUTH_FACEBOOK_SCOPE || 'email'
    },
    Google: {
        consumerKey:    process.env.MUCHMALA_AUTH_GOOGLE_KEY || null,
        consumerSecret: process.env.MUCHMALA_AUTH_GOOGLE_SECRET || null,
        callback:       process.env.MUCHMALA_AUTH_GOOGLE_CALLBACK || config.http.url + '/auth/google',
        scope:          process.env.MUCHMALA_AUTH_GOOGLE_SCOPE || ''
    },
    Yahoo: {
        consumerKey:    process.env.MUCHMALA_AUTH_YAHOO_KEY || null,
        consumerSecret: process.env.MUCHMALA_AUTH_YAHOO_SECRET || null,
        callback:       process.env.MUCHMALA_AUTH_YAHOO_SCOPE || config.http.url + '/auth/yahoo'
    }
};

config.googleAnalyticsKey = process.env.MUCHMALA_GOOGLE_ANALYTICS_KEY || null;
