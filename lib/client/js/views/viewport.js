(function() {

function Viewport(puzzle, user, leaders, twenty) {
    this.element = $('#viewport').viewport();
    this.content = this.element.viewport('content');
    this.puzzle = this.content.find('.puzzle');
    this.frame = this.content.find('.frame');
    this.frameSize = puzzle.get('frameSize');
    
    this.selectedIndicator = $('<div></div>')
            .appendTo(this.element)
            .attr('id', 'selected');
    
    this.menu = new Puzz.Views.MenuDialog(twenty);
    this.create = new Puzz.Views.CreatePuzzleDialog();
    this.noPuzzles = new Puzz.Views.NoPuzzlesDialog(this.create);
    this.complete = new Puzz.Views.CompleteDialog(puzzle, leaders);
    
    this.panel = new Puzz.Views.Panel({
        leaders: leaders, user: user,
        menu: this.menu, puzzle: puzzle,
        create: this.create
    });

    this.pieceSize = 150;

    this.content.draggable({containment: 'parent'});
    this.content.scraggable({containment: 'parent', sensitivity: 10});
    
    var self = this;

    puzzle.bind('change', function() {
        if (puzzle.get('completion') != 100 || 
            self.complete.shown || self.complete.closed) {
            return;
        }
        self.menu.hide();
        self.menu.bind('hidden', function() {
            self.complete.show();
        });
    });

    puzzle.once('change', function() {
        var data = puzzle.toJSON();
        var step = self.step = Math.floor(data.pieceSize / 6);
        
        self.pieceSize = data.pieceSize;
        self.rectSize = step * 4;
        
        var puzzleHeight = (self.rectSize + 1) * data.vLength + step * 2;
        var puzzleWidth = (self.rectSize + 1) * data.hLength + step * 2;
        
        self.puzzle.css({
            'left': self.frameSize + 1,
            'top': self.frameSize + 1,
            'height': puzzleHeight,
            'width': puzzleWidth
        });
        
        self.frame.css({
            'height': puzzleHeight + self.frameSize * 2 + 1,
            'width': puzzleWidth + self.frameSize * 2 + 1
        });
        
        self.element.viewport('size', 
                puzzleHeight + self.frameSize * 2,
                puzzleWidth + self.frameSize * 2);

        self.updateViewportSize();
    });
    
    _.bindAll(this, 'updateViewportSize');
    this.panel.bind('move', this.updateViewportSize);
    this.panel.bind('show', this.updateViewportSize);
    this.panel.bind('hide', this.updateViewportSize);
    $(window).resize(this.updateViewportSize);
    
    if (window.localStorage.menuHowToPlayShown != '1') {
        window.localStorage.menuHowToPlayShown = '1';
        this.menu.show('howtoplay');
    }
    
    this.panel.show();
}

var Proto = Viewport.prototype;

Proto.loading = function(percent) {
    this.panel.loading(percent);
};

Proto.loadingComplete = function() {
    this.panel.loadingComplete();
};

Proto.showSelectedIndicator = function(type) {
    this.selectedIndicator.attr('class', '_' + type).show();
};

Proto.hideSelectedIndicator = function() {
    this.selectedIndicator.hide();
};

Proto.updateViewportSize = function() {
    var windowWidth = $(window).width();
    var panelWidth = windowWidth - this.panel.el.position().left;
    
    this.element.width(windowWidth - panelWidth);
    this.element.viewport('adjust');
};

Proto.showNoPuzzles = function() {
    this.noPuzzles.show();
};

window.Puzz.Views.Viewport = Viewport;

})();