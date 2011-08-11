(function() {

function Viewport(puzzleModel) {
    this.element = $('#viewport').viewport();
    
    this.puzzle = this.element.viewport('content');
    this.frame = this.puzzle.find('.frame');
    
    this.puzzle.draggable({containment: 'parent'});
    this.puzzle.scraggable({containment: 'parent', sensitivity: 10});
    
    var self = this;

    puzzleModel.once('change', function() {
        var data = puzzleModel.toJSON();    
        var puzzleHeight = (data.rectSize + 1) * data.vLength + data.earSize * 2;
        var puzzleWidth = (data.rectSize + 1) * data.hLength + data.earSize * 2;
        
        self.puzzle.css({
            'top': data.frameSize + 1,
            'left': data.frameSize + 1,
            'height': puzzleHeight,
            'width': puzzleWidth
        });
        
        self.frame.css({
            'height': puzzleHeight + data.frameSize * 2 + 1,
            'width': puzzleWidth + data.frameSize * 2 + 1
        });
        
        self.element.viewport('size', 
                puzzleHeight + data.frameSize * 2,
                puzzleWidth + data.frameSize * 2);
        
        self.updateViewportSize();
    });
    
    _.bindAll(this, 'updateViewportSize');
    
    $(window).resize(this.updateViewportSize);
}

var Proto = Viewport.prototype;

Proto.updateViewportSize = function() {
    this.element.viewport('adjust');
};

window.Puzz.Views.Viewport = Viewport;

})();