var path = require('path'),
    fs = require('fs'),
    ejs = require('ejs'),
    async = require('async'),
    exec = require('child_process').exec,
    parser = require('uglify-js').parser,
    uglify = require('uglify-js').uglify,
    muchmalaStorage = require('muchmala-common').storage,
    config = require('./config.js');

var cwd = __dirname + '/';
var libDir = cwd + 'lib';

var jsDir =   libDir + '/client/js/';
var stylDir = libDir + '/client/css/';

var uncompressedJsFiles = [
    jsDir + 'jquery/jquery.scraggable/jquery.scraggable.js',
    jsDir + 'jquery/jquery.viewport/jquery.viewport.js',
    jsDir + 'jquery/jquery.scrolla/jquery.scrolla.js',
    jsDir + 'jquery/jquery.cookie.js',

    jsDir + 'utils.js',
    jsDir + 'third/aim.js',
    jsDir + 'third/flow.js',
    jsDir + 'backbone/backbone.js',
    jsDir + 'backbone/backbone.io.js',
    jsDir + 'messages.js',
    jsDir + 'loader.js',
    jsDir + 'storage.js',
    jsDir + 'server.js',
    jsDir + 'models/user.js',
    jsDir + 'models/puzzle.js',
    jsDir + 'collections/pieces.js',
    jsDir + 'collections/leaders.js',
    jsDir + 'collections/twenty.js',
    jsDir + 'views/puzzle.js',
    jsDir + 'views/piece.js',
    jsDir + 'views/viewport.js',
    jsDir + 'views/dialogs.js',
    jsDir + 'views/panel.js',
    jsDir + 'app.js'
];

var compressedJsFiles = [
    jsDir + 'socket.io/socket.io.min.js',
    jsDir + 'jquery/jquery.min.js',
    jsDir + 'jquery/jquery-ui.js',
    jsDir + 'third/underscore.js'
];

var resultJsFile = jsDir + 'minified.js';
var resultCssFile = stylDir + 'styles.css';

var monifiedStaticFiles = {
    'styles.css' : resultCssFile,
    'minified.js' : resultJsFile
};

var inputFile = stylDir + 'styles.styl';
var stylusUrl = 'lib/stylusUrl.js';

var configFiles = [cwd + 'Jakefile.js', cwd + 'config.js'];
if (path.existsSync(cwd + 'config.local.js')) {
    configFiles.push(cwd + 'config.local.js');
}

var useMinifiedStatic = config.static.minified;
var useNginx = config.storage.type == 'file';

//
// tasks
//
desc('Install project');
task('install', ['prepare-static'].concat(useNginx ? '/etc/nginx/sites-enabled/muchmala.dev' : 'stop-nginx'), function() {
    console.log("Muchmala-frontend is now installed.");
});



desc('Prepare static for frontend server');
task('prepare-static', useMinifiedStatic ? ['static-upload'] : [resultCssFile], function() {});



desc('upload static files to storage');
task('static-upload', [resultJsFile, resultCssFile], function() {
    console.log('Uploading static...');

    if (!config.static.minified) {
        console.log("You are using non-minified version of static which is served locally. No need to upload.");
        return complete();
    }

    var storage, newVersion = 1;

    async.waterfall([function(callback) {
        muchmalaStorage.createStorage(config.storage.type, config.storage[config.storage.type], callback);
    },
    function(stor, callback) {
        storage = stor;

        storage.listDir('static/', callback);

    }, function(contents, callback) {
        var maxVersion = 0;
        Object.keys(contents.dirs).forEach(function(dir) {
            if (+dir > maxVersion) {
                maxVersion = +dir;
            }
        });
        callback(null, maxVersion);

    }, function(lastVersion, callback) {
        if (lastVersion >= newVersion) {
            newVersion = lastVersion + 1;
        }

        storage.listDir('static/' + lastVersion + '/', function(err, contents) {
            if (!contents.files) {
                return callback(null, true);
            }

            for (var name in monifiedStaticFiles) {
                var modificationTime = new Date(fs.statSync(monifiedStaticFiles[name]).mtime);

                if(!contents.files[name] || +modificationTime > +contents.files[name].change) {
                    return callback(null, true);
                }
            }

            return callback(null, false);
        });

    }, function(needToUpload, callback) {
        if (!needToUpload) {
            console.log("Up to date");
            console.log("Current version is " + (newVersion - 1));
            return callback();
        }

        console.log("Uploading version " + newVersion);
        async.forEachSeries(Object.keys(monifiedStaticFiles), function(fileName, callback) {
            console.log('Uploading file ' + monifiedStaticFiles[fileName]);
            storage.put(monifiedStaticFiles[fileName], '/static/' + newVersion + '/' + fileName, callback);
        }, callback);

    }], function(err) {
        if (err) {
            return fail(err, 1);
        }

        console.log('Static is uploaded.');
        complete();
    });
}, true);



desc('Compress JavaScript files');
task('compressjs', [resultJsFile], function() {
    console.log('Js is compressed');
    complete();
});



desc('Generate minified js file');
file(resultJsFile, uncompressedJsFiles, function() {
    var codeToCompress = '';
    var compressedCode = '';

    uncompressedJsFiles.forEach(function(filePath) {
        codeToCompress += fs.readFileSync(filePath).toString();
    });

    compressedJsFiles.forEach(function(filePath) {
        compressedCode += fs.readFileSync(filePath).toString();
    });

    var ast = parser.parse(codeToCompress);
    ast = uglify.ast_mangle(ast);
    ast = uglify.ast_squeeze(ast);

    fs.writeFileSync(resultJsFile, compressedCode + uglify.gen_code(ast));
    console.log('JS is rendered.');
});



desc('Run stylus with "watch" option');
task('stylus-watch', function() {
    runStylus(true, function(err) {
        if (err) {
            return fail(err);
        }

        console.log('Stylus-watch is now running.');
        complete();
    });
}, true);



desc('Run stylus to render CSS once');
task('stylus-render', [resultCssFile], function() {});



desc('Generate minified css file');
file(resultCssFile, getStylFiles(stylDir), function() {
    runStylus(false, function(err) {
        if (err) {
            return fail(err);
        }

        console.log('CSS is rendered.');
        setTimeout(complete, 100);
    });
}, true);



desc('Generate nginx config');
file('/etc/nginx/sites-enabled/muchmala.dev', ['config/nginx.conf.in'].concat(configFiles), function() {
    console.log('Generating nginx config...');
    render('config/nginx.conf.in', '/etc/nginx/sites-enabled/muchmala.dev', {config: config});

    var defaultNginxSiteConfig = '/etc/nginx/sites-enabled/default';
    if (path.existsSync(defaultNginxSiteConfig)) {
        console.log('Removing default nginx config...');
        fs.unlinkSync(defaultNginxSiteConfig);
    }

    restartNginx(function(err) {
        if (err) {
            return fail(err);
        }

        console.log('Nginx is now running.');
        complete();
    });
}, true);



desc("Start/restart nginx");
task('restart-nginx', ['/etc/nginx/sites-enabled/muchmala.dev'], function() {
    restartNginx(function(err) {
        if (err) {
            return fail(err);
        }

        console.log('Nginx is now running.');
        complete();
    });
}, true);



desc("Stop nginx");
task('stop-nginx', function() {
    console.log('Stopping nginx...');
    stopNginx(function() {
        if (err) {
            console.err(err);
        }

        console.log('Nginx is now stopped.');
        complete();
    });

}, true);


//
// helpers
//

function getStylFiles(dir) {
    return scanFiles(dir).filter(function(file) {
        return (file.slice(-5) == '.styl');
    });
}

function scanFiles(dir) {
    // TODO: make it recursive
    var files = fs.readdirSync(dir);
    files = files.filter(function(file) {
        return (file != '.DS_Store');
    });
    files = files.map(function(file) {
        return path.join(dir, file);
    });
    return files;
}

function render(src, dst, options) {
    if (typeof(options) == 'function') {
        callback = options;
        options = {};
    }

    if (!options.root) {
        options.root = __dirname;
    }

    var template = fs.readFileSync(src).toString();
    var result = ejs.render(template, {locals: options});
    fs.writeFileSync(dst, result);
}


function runStylus(watch, callback) {
    var command = 'stylus';

    if (watch) {
        command += ' --watch';
    }

    command += ' --compress';
    command += ' --include ' + stylDir.slice(-1);
    command += ' --use ' + stylusUrl;
    command += ' ' + inputFile;

    exec(command, function(err) {
        if (err) {
            return callback(err);
        }

        callback();
    });
}


function restartNginx(callback) {
    console.log('Restarting nginx...');
    exec('service nginx restart', function(err) {
        if (err) {
            return callback(err);
        }

        callback();
    });
}

function stopNginx(callback) {
    console.log('Stopping nginx...');
    exec('service nginx stop', function(err) {
        if (err) {
            callback(err);
        }

        console.log('Nginx is now stopped.');
        callback();
    });
}