(function() {

function Puzzle(puzzleModel, viewport) {
    this.puzzleModel = puzzleModel;
    this.viewport = viewport;
    
    this.index = {};
    this.pieces = {};
    this.overedPiece = null;
    this.indexCellSize = 0;
    
    var self = this;
    
    this.puzzleModel.once('change', function() {
        self.indexCellSize = self.puzzleModel.get('rectSize');
    });    
    this.viewport.bind('click', function(e) {
        _.each(self.findPieces(e.clientX, e.clientY), function(piece) {
            self.trigger(self.EVENTS.leftClick, piece);
        });
    });
    this.viewport.bind('contextmenu', function(e) {
        self.trigger(self.EVENTS.rightClick);
        e.preventDefault();
        e.stopPropagation();
    });
    this.viewport.bind('mouseout', function() {
        if (self.overedPiece) {
            self.overedPiece.unhighlight();
            self.overedPiece = null;
        }
    });
    this.viewport.bind('mousemove', function(e) {
        _.each(self.findPieces(e.clientX, e.clientY), function(piece) {
            if (!self.overedPiece ||
                 piece.x != self.overedPiece.x || 
                 piece.y != self.overedPiece.y) {
                if (self.overedPiece) {
                    self.overedPiece.unhighlight();
                }
                if (piece.highlight()) {
                    self.overedPiece = piece;
                }
            }
        });
    });
}

_.extend(Puzzle.prototype, Backbone.Events);

var Proto = Puzzle.prototype;

Proto.EVENTS = {
    leftClick: 'leftClick',
    rightClick: 'rightClick'
};

Proto.findPieces = function(clientX, clientY) {
    var offset = this.viewport.offset();
    var eventX = clientX - offset.left;
    var eventY = clientY - offset.top;
    var found = this.checkIndexByCoordinates(eventX, eventY);

    return _.select(found, function(piece) {
        return piece.hasPoint(eventX, eventY);
    });
};

Proto.checkIndexByCoordinates = function(x, y) {
    var xIndex = x - (x % this.indexCellSize);
    var yIndex = y - (y % this.indexCellSize);
    
    if (!_.isUndefined(this.index[xIndex]) &&
        !_.isUndefined(this.index[xIndex][yIndex])) {
        return this.index[xIndex][yIndex];
    }
    return false;
};

Proto.buildIndex = function() {
    var cellSize = this.indexCellSize;
    var pieceSize = this.puzzleModel.get('pieceSize');

    _.each(this.pieces, function(row) {
        _.each(row, function(piece) {
            var cellsCount = 1;
            
            if (pieceSize > cellSize) {
                cellsCount += Math.floor(pieceSize / cellSize);
            }

            for (var h = 0; h < cellsCount; h++) {
                var xIndex = piece.xCoord - (piece.xCoord % cellSize) + (h * cellSize);
                if (this.index[xIndex] == null) {
                    this.index[xIndex] = {};
                }
            
                for (var v = 0; v < cellsCount; v++) {
                    var yIndex = piece.yCoord - (piece.yCoord % cellSize) + (v * cellSize);
                    if (this.index[xIndex][yIndex] == null) {
                        this.index[xIndex][yIndex] = [];
                    }
                
                    this.index[xIndex][yIndex].push(piece);
                }
            }
        }, this);
    }, this);
};

Proto.isSameType = function(first, second) {
    if(first.ears.left == second.ears.left &&
       first.ears.bottom == second.ears.bottom &&
       first.ears.right == second.ears.right &&
       first.ears.top == second.ears.top) {
        return true;
    }
    return false;
};

Proto.swapPieces = function(first, second) {
    var tmpX = first.realX;
    var tmpY = first.realY;
    first.realX = second.realX;
    first.realY = second.realY;
    second.realX = tmpX;
    second.realY = tmpY;
    second.render();
    first.render();
}

Proto.swapPiecesByCoords = function(coords) {
    var first = this.getPiece(coords[0][0], coords[0][1]);
    var second = this.getPiece(coords[1][0], coords[1][1]);
    this.swapPieces(first, second);
    this.blinkPieces([first, second]);
};


Proto.blinkPieces = function(pieces) {  
    (new Puzz.Views.Blinker([[400, 200]], [
        function() {
            _.each(pieces, function(piece) {
                piece.createBorder('blink', 'red', true);
            });
        },
        function() {
            _.each(pieces, function(piece) {
                piece.removeBorder('blink')
            })
        }
    ])).start();
};

Proto.addPiece = function(data) {
    var piece = new Puzz.Views.Piece({
        size: this.puzzleModel.get('pieceSize'),
        earSize: this.puzzleModel.get('earSize'),
        rectSize: this.puzzleModel.get('rectSize'),
        ears: {
            left: data.l, bottom: data.b,
            right: data.r, top: data.t
        },
        x: data.x, y: data.y,
        realX: data.realX,
        realY: data.realY,
        locked: data.d
    });

    this.viewport.append(piece.element);

    if(_.isUndefined(this.pieces[data.y])) {
        this.pieces[data.y] = {};
    }
    return this.pieces[data.y][data.x] = piece;
};

Proto.getPiece = function(x, y) {
    if(!_.isUndefined(this.pieces[y]) &&
       !_.isUndefined(this.pieces[y][x])) {
        return this.pieces[y][x];
    }
    return false;
};

window.Puzz.Views.Puzzle = Puzzle;

})();