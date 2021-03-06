var _ = require('underscore');
var config = require('../../config');
var common = require('muchmala-common');
var logger = common.logger;

var NEW_IMAGES_QUEUE = 'new-image';
var NEW_PUZZLES_QUEUE = 'new-puzzle';
var UPLOADED_IMAGES_DIR = 'uploaded/';

var queue = new common.queueAdapter(config.queue);

var imagesStorage = null;
var type = config.storage.type;
var crdls = config.storage[type];

common.storage.createStorage(type, crdls, function(error, storage) {
    if (error) {
        logger.info('Images storage is not created');
        logger.error(err);
        return;
    }
    imagesStorage = storage;
});

module.exports = function(server) {
    server.post('/create', function(req, res) {
        req.form.complete(function(err, fields, files){
            var userId = 1;
            var errors = [];
        
            fields.size = parseInt(fields.size);
        
            if (!_.include([90, 120, 150], fields.size)) {
                errors.push('piecesSize');
            }
        
            if (_.isUndefined(files.image)) {
                errors.push('imageAbsent');
            }
        
            if (!_.isUndefined(files.image) && 
                files.image.type != 'image/jpeg' && 
                files.image.type != 'image/png') {
                errors.push('imageFormat');
            }
        
            if (_.isUndefined(files.image) && errors.length) {
                res.end(JSON.stringify({errors: errors}));
                return;
            }
        
            var oFileHash = Math.random().toString().substr(2);
            var oFileName = oFileHash + '_' + files.image.name;
            var oFilePath = UPLOADED_IMAGES_DIR + oFileName;
            
            imagesStorage.put(files.image.path, oFilePath, function(error) {
                if (error) {
                    res.end(JSON.stringify({errors: ['fatal']}));
                    return;
                }
                
                var sessionId = common.misc.getUniqueString();
                
                queue.publish(NEW_IMAGES_QUEUE, {
                    sessionId: sessionId,
                    pieceSize: fields.size,
                    name: fields.name,
                    userId: userId,
                    path: oFilePath
                });
                
                queue.subscribe(NEW_PUZZLES_QUEUE + '-' + sessionId, function(data) {
                    if (!_.isUndefined(data.error)) {
                        _.each(data.error.data, function(error) {
                            errors.push(error.short);
                        });
                        res.end(JSON.stringify({errors: errors}));
                    } else {
                        res.end(JSON.stringify(data));
                    }
                });
            });
        });    
    });
};
