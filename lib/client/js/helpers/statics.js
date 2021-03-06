(function() {

function Statics() {
    this.cache = {};
}

var Proto = Statics.prototype;

Proto.images = function(sources, callback) {
    var self = this;
    
    flow.serialForEach(_.toArray(sources), function(src) {
        this.src = src;
        this.image = new Image();
        this.image.src = window.STATIC_HOST + this.src;
        this.image.onload = this;
    }, function() {
        self.cache[this.src] = this.image;
    }, function() {
        callback.call(null);
    });
};

Proto.covers = function(pieceSize, callback) {
    var sources = {
        defaultCoverSrc: '/covers/' + pieceSize + '/default_covers.png',
        selectCoverSrc: '/covers/' + pieceSize + '/select_covers.png',
        lockCoverSrc: '/covers/' + pieceSize + '/lock_covers.png'
    };

    this.images(sources, _.bind(function() {
        callback({
            'default': this.cache[sources.defaultCoverSrc],
            select: this.cache[sources.selectCoverSrc],
            lock: this.cache[sources.lockCoverSrc]
        });
    }, this));
};

Proto.frame = function(pieceSize, callback) {
    var sources = {
        frameSrc: '/frames/' + pieceSize + '/frame.png'
    };

    this.images(sources, _.bind(function() {
        callback(this.cache[sources.frameSrc]);
    }, this));
};

Proto.sprites = function(puzzleId, rows, cols, callbackSprite, callbackFinish) {
    var dir = '/puzzles/' + puzzleId + '/';
    var count = rows * cols;
    var self = this;
    
    for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
        (function(src, row, col) {
            self.images([src], function() {
                callbackSprite(row, col, self.cache[src]);
                if (!--count) {
                    callbackFinish();
                }
            });
        })(dir + i + '_' + j + '_pieces.png', i, j);
    }}
};

window.Puzz.Helpers.Statics = Statics;

})();