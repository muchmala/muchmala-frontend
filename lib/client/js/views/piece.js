(function() {

function Piece(settings) {
    this.x = settings.x;
    this.y = settings.y;
    this.ears = settings.ears;
    this.images = Piece.IMAGES;
            
    this.realX = settings.realX;
    this.realY = settings.realY;
    this.size = settings.size;
    this.earSize = settings.earSize;
    this.rectSize = settings.rectSize;

    this.xCoord = this.x * (this.rectSize + 1);
    this.yCoord = this.y * (this.rectSize + 1);

    this.locked = settings.locked;
    this.selected = false;
    this.highlighted = false;
    this.borders = {};
    
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.element = this.canvas;

    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.canvas.style.top = this.yCoord +'px';
    this.canvas.style.left = this.xCoord + 'px';
    
    this.render();
};

Piece.IMAGES = {
    sprites: {},
    defaultCover: null,
    selectCover: null,
    lockCover: null
};

Piece.SPRITE_SIZE = 5;
Piece.HIGHLIGHTED_BORDER_COLOR = 'gold';
Piece.SELECTED_BORDER_COLOR = 'blue';
Piece.LOCKED_BORDER_COLOR = 'red';

Piece.setImages = function(images) {
    Piece.IMAGES = _.extend(Piece.IMAGES, images);
};
Piece.setSpriteSize = function(spriteSize) {
    Piece.SPRITE_SIZE = spriteSize;
};
Piece.setSprite = function(row, col, image) {
    if (_.isUndefined(Piece.IMAGES.sprites[row])) {
        Piece.IMAGES.sprites[row] = {};
    }
    Piece.IMAGES.sprites[row][col] = image;
};

Piece.coverOffsets = {
    '0000': [0, 0], '1111': [1, 0],
    '1000': [2, 0], '0100': [3, 0],
    '0010': [0, 1], '0001': [1, 1],
    '1110': [2, 1], '0111': [3, 1],
    '1101': [0, 2], '1011': [1, 2],
    '1100': [2, 2], '0011': [3, 2],
    '0110': [0, 3], '1001': [1, 3],
    '0101': [2, 3], '1010': [3, 3]
};

var Proto = Piece.prototype;

Proto.render = function() {
    var spriteRow = Math.floor(this.realY / Piece.SPRITE_SIZE);
    var spriteCol = Math.floor(this.realX / Piece.SPRITE_SIZE);

    this.ctx.clearRect(0, 0, this.size, this.size);
    this.ctx.drawImage(this.images.sprites[spriteRow][spriteCol],  
                       this.realX % Piece.SPRITE_SIZE * this.size,
                       this.realY % Piece.SPRITE_SIZE * this.size,
                       this.size, this.size, 0, 0, this.size, this.size);
    
    if (!this.isCollected()) {
        if (this.locked) {
            this.cover(this.images.lockCover);
        } else if (this.selected) {
            this.cover(this.images.selectCover)
        } else if (!this.highlighted) {
            this.cover(this.images.defaultCover);
        }
    }
    
    return this.canvas;
};

Proto.cover = function(coverImage) {
    var type = this.type();
    this.ctx.drawImage(coverImage, Piece.coverOffsets[type][0] * this.size,
                       Piece.coverOffsets[type][1] * this.size, this.size,
                       this.size, 0, 0, this.size, this.size);
};

Proto.type = function() {
    var type = '';
    type += this.ears.left ? '1' : '0';
    type += this.ears.top ? '1' : '0';
    type += this.ears.right ? '1' : '0';
    type += this.ears.bottom ? '1' : '0';
    return type;
};

Proto.select = function() {
    this.removeHighlightedBorder();
    this.createSelectedBorder();
    this.selected = true;
    this.render();
};
Proto.lock = function(title) {
    this.createLockedBorder();
    this.locked = true;
    this.render();
};
Proto.highlight = function() {
    this.createHighlightedBorder();
    this.highlighted = true;
    this.render();
};
Proto.unselect = function() {
    this.removeSelectedBorder();
    this.selected = false;
    this.render();
};
Proto.unlock = function() {
    this.removeLockedBorder();
    this.locked = false;
    this.render();
};
Proto.unhighlight = function() {
    this.removeHighlightedBorder();
    this.highlighted = false;
    this.render();
};
Proto.createHighlightedBorder = function() {
    this.createBorder('highlighted', Piece.HIGHLIGHTED_BORDER_COLOR);
};
Proto.removeHighlightedBorder = function() {
    this.removeBorder('highlighted');
};
Proto.createSelectedBorder = function() {
    this.createBorder('selected', Piece.SELECTED_BORDER_COLOR);
};
Proto.removeSelectedBorder = function() {
    this.removeBorder('selected');
};
Proto.createLockedBorder = function() {
    this.createBorder('locked', Piece.LOCKED_BORDER_COLOR);
};
Proto.removeLockedBorder = function() {
    this.removeBorder('locked');
};
Proto.createBorder = function(name, color, foreground) {
    var border = {
        vert: $('<div class="tileBorder"></div>'),
        horz: $('<div class="tileBorder"></div>')
    };
    if (foreground) {
        border.vert.addClass('top');
        border.horz.addClass('top');
    }
    border.vert.css({
        'background': color,
        'left': this.xCoord + this.earSize,
        'top': this.yCoord - 1,
        'width': this.rectSize,
        'height': this.size + 2
    });
    border.horz.css({
        'background': color,
        'left': this.xCoord - 1,
        'top': this.yCoord + this.earSize,
        'width': this.size + 2,
        'height': this.rectSize
    });
    $(this.canvas).after(border.vert);
    $(this.canvas).after(border.horz);
    this.borders[name] = border;
};

Proto.removeBorder = function(name) {
    if (!_.isUndefined(this.borders[name])) {
        this.borders[name].vert.remove();
        this.borders[name].horz.remove();
        delete this.borders[name];
    }
};

Proto.hasPoint = function(x, y) {
    var s = this.size / 6;
    var xc = this.xCoord;
    var yc = this.yCoord;

    if((x >= xc+s && y >= yc+s && x <= xc+s*2.5 && y <= yc+s*2.5) ||
       (x >= xc+s*3.5 && y >= yc+s && x <= xc+s*5 && y <= yc+s*2.5) ||
       (x >= xc+s && y >= yc+s*3.5 && x <= xc+s*2.5 && y <= yc+s*5) ||
       (x >= xc+s*3.5 && y >= yc+s*3.5 && x <= xc+s*5 && y <= yc+s*5) ||
       (x >= xc+s*2 && y >= yc+s*2 && x <= xc+s*4 && y <= yc+s*4) ||
       (this.ears.left && x >= xc && y >= yc+s*2.5 && x <= xc+s*2 && y <= yc+s*3.5) ||
       (this.ears.bottom && x >= xc+s*2.5 && y >= yc+s*4 && x <= xc+s*3.5 && y <= yc+s*6) ||
       (this.ears.right && x >= xc+s*4 && y >= yc+s*2.5 && x <= xc+s*6 && y <= yc+s*3.5) ||
       (this.ears.top && x >= xc+s*2.5 && y >= yc && x <= xc+s*3.5 && y <= yc+s*2)) {
        return true;
    }
    return false;
};

Proto.isCollected = function() {
    return this.realX == this.x && this.realY == this.y;
};

window.Puzz.Views.Piece = Piece;

})();