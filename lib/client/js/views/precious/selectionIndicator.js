(function(Puzz) {

function SelectionIndicator(viewport) {
    this.element = $('<div></div>');
    this.element.appendTo(viewport);
    this.element.attr('id', 'selected');
    
    var self = this;
    this.blinker = new Puzz.Views.Blinker([[4750, 250]], [
        function() {self.element.fadeIn(100);},
        function() {self.element.fadeOut(100);}
    ], 15000);
}

var Proto = SelectionIndicator.prototype;

Proto.show = function(type) {
    this.element.attr('class', '_' + type).show();
    this.blinker.start();
};

Proto.hide = function() {
    this.element.fadeOut(100);
    this.blinker.stop();
};

Puzz.Views.SelectionIndicator = SelectionIndicator;

})(window.Puzz);