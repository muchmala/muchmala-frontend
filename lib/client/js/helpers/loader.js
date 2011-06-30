window.Puzz.Helpers.Loader = (function() {
    
    var statics = new Puzz.Helpers.Statics();
    var objectsLoaded = 0;
    var objectsToLoad = 4;

    function calcLoading(loadedCount) {
        objectsLoaded += loadedCount;
        return Math.floor(objectsLoaded * 100 / objectsToLoad);
    }
    
    return flow.define(
        
    function(settings) {
        this.viewport = settings.viewport;
        this.puzzleView = settings.puzzleView;
        this.puzzleModel = settings.puzzleModel;
        this.piecesCollection = settings.piecesCollection;
        this.onProgress = settings.onProgress;
        this.onFinish = settings.onFinish;
        
        statics.covers(this.puzzleModel.get('pieceSize'), this); 
    },
    function(covers) {
        var puzzleId   = this.puzzleModel.get('id');
        var spriteSize = this.puzzleModel.get('spriteSize');
        var rows = Math.ceil(this.puzzleModel.get('vLength') / spriteSize);
        var cols = Math.ceil(this.puzzleModel.get('hLength') / spriteSize);
        
        objectsToLoad += rows * cols;        
        
        Puzz.Views.Piece.setSpriteSize(spriteSize);
        Puzz.Views.Piece.setImages({
            lockCover: covers.lock,
            selectCover: covers.select,
            defaultCover: covers['default']
        });
        
        var self = this;
        
        this.onProgress(calcLoading(3));
        
        statics.sprites(puzzleId, rows, cols, function(row, col, sprite) {
            Puzz.Views.Piece.setSprite(row, col, sprite);
            
            self.onProgress(calcLoading(1));

            var piecesToShow = _.select(self.piecesCollection.toJSON(), function(piece) {
                return piece.realX >= col * spriteSize && piece.realY >= row * spriteSize
                            && piece.realX <= (col * spriteSize) + spriteSize - 1
                            && piece.realY <= (row * spriteSize) + spriteSize - 1;
            });

            _.each(piecesToShow, function(pieceData) {
                self.puzzleView.addPiece(pieceData);
            });
            
        }, this);
    },
    
    function() {
        statics.frame(this.puzzleModel.get('pieceSize'), this);
    },
    
    function(sprite) {
        (new Puzz.Views.Frame({
            element: this.viewport.frame,
            pieces: this.piecesCollection,
            puzzle: this.puzzleModel,
            sprite: sprite
        })).render();
        
        this.onProgress(calcLoading(1));
        this.onFinish();
    });
})();