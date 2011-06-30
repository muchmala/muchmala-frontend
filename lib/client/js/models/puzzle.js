Puzz.Models.Puzzle = Backbone.IO.Model.extend({
    defaults: {
        'id'        : null,
        'created'   : null,
        'completed' : null,
        'swaps'     : 0,
        'pieceSize' : 0,
        'rectSize'  : 0,
        'earSize'   : 0,
        'frameSize' : 3,
        'spriteSize': 0,
        'connected' : 0,
        'completion': 0,
        'vLength'   : 0,
        'hLength'   : 0
    },
    
    messages: {
        'puzzleData': 'refresh'
    },
    
    initialize: function() {
        this.set({'id': document.location.hash.replace('#', '') || null});
    },
    
    refresh: function(data) {
        if (!_.isUndefined(data.completed)) {data.completed = new Date(data.completed);}
        if (!_.isUndefined(data.created)) {data.created = new Date(data.created);}
        
        data.earSize = Math.floor(data.pieceSize / 6);
        data.rectSize = data.earSize * 4;
        
        this.set(data);
    }
});