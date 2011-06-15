var path = require('path'),
    fs = require('fs'),
    ejs = require('ejs'),
    async = require('async'),
    exec = require('child_process').exec,
    parser = require('uglify-js').parser,
    uglify = require('uglify-js').uglify,
    muchmalaStorage = require('muchmala-common').storage,
    config = require('./config.js');

var jsDir =   'lib/client/js/';
var stylDir = 'lib/client/css/';

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

var configFiles = ['Jakefile.js', 'config.js'];
if (path.existsSync('config.local.js')) {
    configFiles.push('config.local.js');
}

//
// tasks
//

desc('start all services');
task('start', ['install'], function() {
    console.log('Starting all services...');
    exec('supervisorctl start muchmala:', function(err, stdout, stderr) {
        if (err) {
            throw err;
        }

        console.log('DONE');
        complete();
    });
}, true);



desc('stop all services');
task('stop', [], function() {
    console.log('Stopping all services...');
    exec('supervisorctl stop muchmala:', function(err, stdout, stderr) {
        if (err) {
            throw err;
        }

        console.log('DONE');
        complete();
    });
}, true);



desc('restart all services');
task('restart', ['install'], function() {
    console.log('Restarting all services...');
    exec('supervisorctl restart muchmala:', function(err, stdout, stderr) {
        if (err) {
            throw err;
        }

        console.log('DONE');
        complete();
    });
}, true);



desc('install project');
var deps = ['config', 'restart-supervisor'];
if (config.storage.type == 'file') {
    deps.push('restart-nginx', resultCssFile);
}
task('install', deps, function() {
});



desc('restart nginx');
task('restart-nginx', ['/etc/nginx/sites-enabled/muchmala.dev'], function() {
    console.log('Restarting nginx...');
    exec('service nginx restart', function(err, stdout, stderr) {
        if (err) {
            throw err;
        }

        console.log('DONE');
        complete();
    });
}, true);



desc('restart supervisor');
task('restart-supervisor', ['/etc/supervisor/conf.d/muchmala.conf'], function() {
    console.log('Restarting supervisor...');
    exec('/etc/init.d/supervisor stop', function(err, stdout, stderr) {
        if (err) {
            throw err;
        }

        exec('/etc/init.d/supervisor start', function(err, stdout, stderr) {
            if (err) {
                throw err;
            }

            console.log('DONE');
            complete();
        });
    });
}, true);



desc('generate configs');
var deps = ['/etc/supervisor/conf.d/muchmala.conf'];
if (config.storage.type == 'file') {
    deps.push('/etc/nginx/sites-enabled/muchmala.dev');
}
task('config', deps, function() {});



desc('generate supervisor config');
file('/etc/supervisor/conf.d/muchmala.conf', ['config/supervisor.conf.in'].concat(configFiles), function() {
    console.log('Generating supervisor config...');
    render('config/supervisor.conf.in', '/etc/supervisor/conf.d/muchmala.conf', {config: config});
    console.log('DONE');
});



desc('generate nginx config');
file('/etc/nginx/sites-enabled/muchmala.dev', ['config/nginx.conf.in'].concat(configFiles), function() {
    console.log('Generating nginx config...');
    render('config/nginx.conf.in', '/etc/nginx/sites-enabled/muchmala.dev', {config: config});
    console.log('DONE');

    var defaultNginxSiteConfig = '/etc/nginx/sites-enabled/default';
    if (path.existsSync(defaultNginxSiteConfig)) {
        console.log('Removing default nginx config...');
        fs.unlinkSync(defaultNginxSiteConfig);
        console.log('DONE');
    }
});



desc('upload static files to storage');
task('static-upload', [resultJsFile, resultCssFile], function() {
    if (!config.static.minified) {
        console.log("You are using non-minified version of static");
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
            console.log(err);
            return complete();
        }

        console.log('DONE');
    });
}, true);



desc('compress JavaScript files');
task('compressjs', [resultJsFile], function() {
    console.log('DONE');
    complete();
});



desc('generate minified js file');
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
    console.log('JS is rendered');
});



desc('Run stylus with "watch" option');
task('stylus-watch', [], function() {
    runStylus(true);
});



desc('Run stylus to render CSS once');
task('stylus-render', [resultCssFile], function() {
});



desc('generate minified css file');
file(resultCssFile, getStylFiles(stylDir), function() {
    runStylus(false, function() {
        console.log('CSS is rendered');
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

    exec(command, function(error) {
        if (error) throw error;
        if (callback) callback();
    });
}