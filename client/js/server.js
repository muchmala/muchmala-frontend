Puzzle.Server = (function() {
    var observer = Utils.Observer();
    var socket = new io.Socket(config.HOST);
    
    socket.on('message', function(data) {
        var parsed = JSON.parse(data);
        log('received ' + parsed.event);
        if(parsed.event != null) {
            observer.fire(parsed.event, parsed.data);
        }
    });

    socket.on('disconnect', function() {
        log('Disconnected');
    });
    
    socket.on('connect', function() {
        observer.fire('connected');
    });

    function sendMessage(message) {
        if(socket.connected) {
            log('sent ' + message);
            socket.send(message);
        } else {
            log('Socket is not connected');
        }
    }

    function createMessage(action, data) {
        return JSON.stringify({action: action, data: data});
    }

    var publicInterface = {
        subscribe: observer.subscribe,
        
        connect: function() {
            socket.connect();
        },
        initialize: function(mapId, userId) {
            var data = {mapId: mapId};
            if(userId) {
                data.userId = userId
            }
            sendMessage(createMessage(MESSAGES.initialize, data));
        },
        getPiecesData: function(puzzleId) {
            sendMessage(createMessage(MESSAGES.piecesData, puzzleId));
        },
        getUserData: function(userId) {
            sendMessage(createMessage(MESSAGES.userData, userId));
        },
        setUserName: function(userName) {
            sendMessage(createMessage(MESSAGES.setUserName, userName));
        },
        lockPiece: function(x, y) {
            sendMessage(createMessage(MESSAGES.lockPiece, [x, y]));
        },
        unlockPiece: function(x, y) {
            sendMessage(createMessage(MESSAGES.unlockPieces, [[x, y]]));
        },
        selectPiece: function(x, y) {
            sendMessage(createMessage(MESSAGES.selectPiece, [x, y]));
        },
        releasePiece: function(x, y) {
            sendMessage(createMessage(MESSAGES.releasePiece, [x, y]));
        },
        swapPieces: function(x1, y1, x2, y2) {
            sendMessage(createMessage(MESSAGES.swapPieces, [[x1, y1], [x2, y2]]));
        }
    };

    return publicInterface;
})();

