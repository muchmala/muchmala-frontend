(function() {

function Frame(settings) {
    this.element = settings.element;
    this.pieces = settings.pieces;
    this.puzzle = settings.puzzle;
    
    this.rectSize = this.puzzle.get('rectSize');
    this.earSize = this.puzzle.get('earSize');
    
    // OVERRIDDEN IN CHILD CLASSES
    this.width = null;
    this.height = null;
    this.spriteOffsetX = null;
    this.spriteOffsetY = null;
    
    Tile.setSprite(settings.sprite);
}

var FrameProto = Frame.prototype;

FrameProto.render = function() {
    var rows = this.puzzle.get('vLength');
    var cols = this.puzzle.get('hLength');
    var size = this.puzzle.get('frameSize');
    
    var border = 1;
    var offset = this.earSize + size + border;
    var rectWithBorderSize = this.rectSize + border;
    
    var deafults = {
        rectSize: this.rectSize,
        earSize: this.earSize,
        size: size
    };
    
    for(var row = rows; row--;) {
        var leftTile = new VerticalLeftTile(_.extend({
            yCoord: row * rectWithBorderSize + offset,
            ear: !this.pieces.getData(0, row).l
        }, deafults));
        
        var rightTile = new VerticalRightTile(_.extend({
            yCoord: row * rectWithBorderSize + offset,
            ear: !this.pieces.getData(cols - 1, row).r
        }, deafults));
        
        leftTile.render();
        rightTile.render();
        
        this.element.append(leftTile.element);
        this.element.append(rightTile.element);
    }
    
    for(var col = cols; col--;) {
        var topTile = new HorizontalTopTile(_.extend({
            xCoord: col * rectWithBorderSize + offset,
            ear: !this.pieces.getData(col, 0).t
        }, deafults));
        
        var bottomTile = new HorizontalBottomTile(_.extend({
            xCoord: col * rectWithBorderSize + offset,
            ear: !this.pieces.getData(col, rows - 1).b
        }, deafults));
        
        topTile.render();
        bottomTile.render();
        
        this.element.append(topTile.element);
        this.element.append(bottomTile.element);
    }
    
    this.element.find('.corner').width(this.earSize + size).height(this.earSize + size);
};

function Tile(settings) {
    this.size = settings.size;
    this.earSize = settings.earSize;
    this.rectSize = settings.rectSize;
    this.xCoord = settings.xCoord;
    this.yCoord = settings.yCoord;
    
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.element = $(this.canvas).addClass('tile');

    this.canvas.style.top = this.yCoord + 'px';
    this.canvas.style.left = this.xCoord + 'px';
};

Tile.SPRITE = null;

Tile.setSprite = function(sprite) {
    Tile.SPRITE = sprite;
};

var TileProto = Tile.prototype;

TileProto.render = function() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(Tile.SPRITE, this.spriteOffsetX, this.spriteOffsetY,
                                    this.width, this.height, 0, 0, 
                                    this.width, this.height);
};

function HorizontalTile(settings) {
    HorizontalTile.superproto.constructor.call(this, settings);
    
    this.width = this.rectSize;
    this.height = this.earSize * 2 + this.size;
}

Puzz.Utils.inherit(HorizontalTile, Tile);

function VerticalTile(settings) {
    VerticalTile.superproto.constructor.call(this, settings);
    
    this.height = this.rectSize;
    this.width = this.earSize * 2 + this.size;
}

Puzz.Utils.inherit(VerticalTile, Tile);

function HorizontalTopTile(settings) {
    HorizontalTopTile.superproto.constructor.call(this, settings);
    
    if (settings.ear) {
        this.spriteOffsetX = 0;
        this.spriteOffsetY = this.height;
    } else {
        this.spriteOffsetX = 0;
        this.spriteOffsetY = this.height * 3;
    }
    
    this.element.addClass('top')
}

Puzz.Utils.inherit(HorizontalTopTile, HorizontalTile);

function HorizontalBottomTile(settings) {
    HorizontalBottomTile.superproto.constructor.call(this, settings);
    
    if (settings.ear) {
        this.spriteOffsetX = 0;
        this.spriteOffsetY = 0;
    } else {
        this.spriteOffsetX = 0;
        this.spriteOffsetY = this.height * 2;
    }
    
    this.element.addClass('bottom')
}

Puzz.Utils.inherit(HorizontalBottomTile, HorizontalTile);

function VerticalLeftTile(settings) {
    VerticalLeftTile.superproto.constructor.call(this, settings);
    
    if (settings.ear) {
        this.spriteOffsetX = this.rectSize + this.width;
        this.spriteOffsetY = 0;
    } else {
        this.spriteOffsetX = this.rectSize + this.width;
        this.spriteOffsetY = this.height;
    }
    
    this.element.addClass('left')
}

Puzz.Utils.inherit(VerticalLeftTile, VerticalTile);

function VerticalRightTile(settings) {
    VerticalRightTile.superproto.constructor.call(this, settings);
    
    if (settings.ear) {
        this.spriteOffsetX = this.rectSize;
        this.spriteOffsetY = 0;
    } else {
        this.spriteOffsetX = this.rectSize;
        this.spriteOffsetY = this.height;
    }
    
    this.element.addClass('right')
}

Puzz.Utils.inherit(VerticalRightTile, VerticalTile);

window.Puzz.Views.Frame = Frame;

})();