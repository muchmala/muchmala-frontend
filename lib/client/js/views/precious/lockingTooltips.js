(function() {

function LockingTooltips(puzzleModel, viewport) {
    this.tooltips = {};
    this.viewport = viewport;
    this.rectSize = puzzleModel.get('rectSize') + 1;
    this.pieceSize = puzzleModel.get('pieceSize');
}

var Proto = LockingTooltips.prototype;

Proto.add = function(x, y, title) {
    if (!_.isUndefined(this.tooltips[y]) && 
        !_.isUndefined(this.tooltips[y][x])) {
        return;
    }
    
    var tooltip = $('<div><span>' + title + '</span></div>');
    tooltip.css('left', x * this.rectSize + this.pieceSize / 2);
    tooltip.css('top', y * this.rectSize + this.pieceSize / 2);
    tooltip.appendTo(this.viewport);
    tooltip.addClass('tooltip');

    tooltip.css('margin-left', -tooltip.outerWidth() / 2);

    if (_.isUndefined(this.tooltips[y])) {
        this.tooltips[y] = {};
    }
    this.tooltips[y][x] = tooltip;
};

Proto.remove = function(x, y) {
    if (!_.isUndefined(this.tooltips[y]) && 
        !_.isUndefined(this.tooltips[y][x])) {
        this.tooltips[y][x].remove();
        delete this.tooltips[y][x];
    }
};

Proto.clear = function() {
    _.each(this.tooltips, function(row) {
        _.each(row, function(tooltip) {
            tooltip.remove();
        });
    });
    this.tooltips = {};
};

window.Puzz.Views.LockingTooltips = LockingTooltips;

})();