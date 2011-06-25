Puzz.Collections.Pieces = Backbone.IO.Collection.extend({
    index: {},
    
    messages: {
        'piecesData': 'update'
    },
    
    fetch: function() {
        this.socket.getPiecesData();
    },
    
    update: function(data) {
        this.refresh(data);
        this.buildIndex();
    },
    
    buildIndex: function() {
        var piecesData = this.toJSON();
        
        _.each(piecesData, _.bind(function(pieceData) {
            if (_.isUndefined(this.index[pieceData.y])) {
                this.index[pieceData.y] = {};
            }
            this.index[pieceData.y][pieceData.x] = pieceData;
        }, this));
    },
    
    getData: function(x, y) {
        return this.index[y][x];
    }
});