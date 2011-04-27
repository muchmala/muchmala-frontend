(function() {

function Puzzle(server) {
	Puzzle.superproto.constructor.call(this, {
        'id': null,
    	'created': null,
    	'completed': null,
    	'swaps': 0,
    	'pieceSize': 0,
    	'spriteSize': 0,
    	'connected': 0,
    	'completion': 0,
    	'vLength': 0,
    	'hLength': 0,
    	'pieces': []
    });
    
	this.server = server;	
	this.server.on(MESSAGES.puzzleData, _.bind(function(data) {
		if (!_.isUndefined(data.completed)) {data.completed = new Date(data.completed);}
		if (!_.isUndefined(data.created)) {data.created = new Date(data.created);}
        this.refresh(data);
    }, this));
	
	this.server.on(MESSAGES.piecesData, _.bind(function(data) {
		this.set('pieces', data);
	}, this));
}

Puzz.Utils.inherit(Puzzle, Puzz.Model);

var Proto = Puzzle.prototype;

Proto.fetchPieces = function() {
    this.server.getPiecesData();
}

Puzz.Models.Puzzle = Puzzle;

})();