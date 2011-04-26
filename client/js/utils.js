(function() {

var Utils = {
    inherit: function(child, parent) {
    	function F() {}
    	F.prototype = parent.prototype;
    	child.prototype = new F();
    	child.prototype.constructor = child;
    	child.superproto = parent.prototype;
    	return child;
    }
};
    
window.Puzz.Utils = Utils;

})();