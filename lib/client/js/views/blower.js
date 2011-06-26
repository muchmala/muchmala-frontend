(function() {

function Blower(user, viewport, pieceSize, rectSize) {
    this.viewport = viewport;
    this.rectSize = rectSize + 1;
    this.pieceSize = pieceSize;
    
    this.animateCss = {
        'margin-top': -120, 
        'font-size': 80, 
        'opacity': 0
    };
    
    var self = this;
    
    user.bind('score', function(pieces) {
        _.each(pieces, function(piece) {
            self.blowScore(piece.x, piece.y, piece.pts);
        });
    });
}

var Proto = Blower.prototype;

Proto.blowScore = function(x, y, score) {
    var score = $('<div class="score">' + score + '</div>');
    score.css('left', x * this.rectSize + this.pieceSize / 2);
    score.css('top', y * this.rectSize + this.pieceSize / 2);
    score.appendTo(this.viewport);
    
    score.animate(this.animateCss, 700, function() {
        score.remove();
    });
};

window.Puzz.Views.Blower = Blower;

})();