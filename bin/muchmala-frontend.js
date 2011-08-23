#!/usr/bin/env node

var fs = require('fs'),
    path = require('path');

var config = require('../config');

var piddir = process.env.MUCHMALA_FRONTEND_PIDDIR || '/var/run/muchmala-frontend';
var logdir = process.env.MUCHMALA_FRONTEND_LOGDIR || '/var/log/muchmala-frontend';

if (!path.existsSync(logdir)) {
    console.error('Logfiles directory doesn\'t exsist, creating:', logdir);
    fs.mkdirSync(logdir, 0755);
}

if (!path.existsSync(piddir)) {
    console.error('Pidfiles directory doesn\'t exsist, creating:', piddir);
    fs.mkdirSync(piddir, 0755);
}

var cluster = require('cluster');
cluster('../lib/server')
    .set('socket path', piddir)
    .use(cluster.logger(logdir))
    .use(cluster.pidfiles(piddir))
    .use(cluster.cli())
    .listen(config.http.port, config.http.host);
