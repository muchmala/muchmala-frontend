(function() {

function Viewport(puzzleModel, panelView) {
    this.element = $('#viewport').viewport();
    
    this.content = this.element.viewport('content');
    this.puzzle = this.content.find('.puzzle');
    this.frame = this.content.find('.frame');
    
    this.content.draggable({containment: 'parent'});
    this.content.scraggable({containment: 'parent', sensitivity: 10});
    
    this._panel = panelView;
    
    var self = this;

    puzzleModel.once('change', function() {
        var data = puzzleModel.toJSON();    
        var puzzleHeight = (data.rectSize + 1) * data.vLength + data.earSize * 2;
        var puzzleWidth = (data.rectSize + 1) * data.hLength + data.earSize * 2;
        
        self.puzzle.css({
            'left': data.frameSize + 1,
            'top': data.frameSize + 1,
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
    this._panel.bind('move', this.updateViewportSize);
    this._panel.bind('show', this.updateViewportSize);
    this._panel.bind('hide', this.updateViewportSize);
    $(window).resize(this.updateViewportSize);
}

var Proto = Viewport.prototype;

Proto.updateViewportSize = function() {
    var windowWidth = $(window).width();
    var panelWidth = windowWidth - this._panel.el.position().left;
    
    this.element.width(windowWidth - panelWidth);
    this.element.viewport('adjust');
};

window.Puzz.Views.Viewport = Viewport;

})();