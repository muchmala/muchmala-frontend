(function() {

function SelectionIndicator(viewport) {
    this.element = $('<div></div>');
    this.element.appendTo(viewport);
    this.element.attr('id', 'selected');
}

var Proto = SelectionIndicator.prototype;

Proto.show = function(type) {
    this.element.attr('class', '_' + type).show();
};

Proto.hide = function() {
    this.element.hide();
};

window.Puzz.Views.SelectionIndicator = SelectionIndicator;

})();