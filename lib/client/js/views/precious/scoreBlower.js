(function() {

function ScoreBlower(userModel, puzzleModel, viewport) {
    this.viewport = viewport;
    this.rectSize = puzzleModel.get('rectSize') + 1;
    this.pieceSize = puzzleModel.get('pieceSize');
    
    this.animateCss = {
        'margin-top': -120, 
        'font-size': 80, 
        'opacity': 0
    };
    
    var self = this;
    
    userModel.bind('score', function(pieces) {
        _.each(pieces, function(piece) {
            self.blowScore(piece.x, piece.y, piece.pts);
        });
    });
}

var Proto = ScoreBlower.prototype;

Proto.blowScore = function(x, y, score) {
    var score = $('<div class="score">' + score + '</div>');
    score.css('left', x * this.rectSize + this.pieceSize / 2);
    score.css('top', y * this.rectSize + this.pieceSize / 2);
    score.appendTo(this.viewport);
    
    score.animate(this.animateCss, 700, function() {
        score.remove();
    });
};

window.Puzz.Views.ScoreBlower = ScoreBlower;

})();