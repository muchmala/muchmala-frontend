(function() {

function Blinker(timeline, frames, delay) {
    this.timeline = timeline;
    this.frames = frames;
    this.delay = delay || 0;
    this.timeout = null;
}

var Proto = Blinker.prototype;

Proto.start = function() {
    var self = this;
    
    this.timeout = setTimeout(function() {
        
        flow.serialForEach(self.timeline, function(segment) {
            var callback = this;
            var totalLength = segment[0];
            var blinkLength = segment[1];
            var framesCount = self.frames.length;
            
            var blinksCount = Math.floor(totalLength / blinkLength);
            var frameTimeout = Math.floor(blinkLength / framesCount);
            
            var blinkIndex = 0;
            var blink = function() {
                
                var frameIndex = 0;
                var interval = setInterval(function() {
                    self.frames[frameIndex++]();
                    
                    if (frameIndex == framesCount) {
                        clearInterval(interval);
                    }
                    if (frameIndex == framesCount &&
                        blinkIndex == blinksCount) {
                        callback();
                    }
                }, frameTimeout);
                
                if (++blinkIndex < blinksCount) {
                    self.timeout = setTimeout(blink, blinkLength);
                }
            };
            
            self.timeout = setTimeout(blink, this.curItem == 1 ? 0 : blinkLength);
        });
    }, this.delay);
};

Proto.stop = function() {
    clearTimeout(this.timeout);
};

window.Puzz.Views.Blinker = Blinker;

})();