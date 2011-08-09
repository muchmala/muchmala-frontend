$(function() {
    
    var Puzz = window.Puzz;
    
    if ($.browser.msie && $.browser.version < 9.0) {
        $('#browser').show();
        return;
    }
    
    var server      = new Puzz.Server();
    var userModel   = new Puzz.Models.User(server);
    var puzzleModel = new Puzz.Models.Puzzle(server);
    var twentyCollection  = new Puzz.Collections.Twenty();
    var piecesCollection  = new Puzz.Collections.Pieces(server);
    var leadersCollection = new Puzz.Collections.Leaders(server);

    var createDialog    = new Puzz.Views.CreatePuzzleDialog();
    var completeDialog  = new Puzz.Views.CompleteDialog(puzzleModel, leadersCollection);
    
    var userPanelView = new Puzz.Views.UserPanel({
        model: userModel
    });
    var infoPanelView = new Puzz.Views.InfoPanel({
        puzzleModel: puzzleModel,
        leadersCollection: leadersCollection,
        twentyCollection: twentyCollection,
        createDialog: createDialog
    });
    
    var viewport = new Puzz.Views.Viewport(puzzleModel);
    var titleView = new Puzz.Views.TitleView(createDialog);
    var puzzleView = new Puzz.Views.Puzzle(puzzleModel, viewport.puzzle);
    var selected;
        
    server.bind('connected', function() {
        server.initialize(userModel.get('aid'), userModel.get('sid'), puzzleModel.get('id'));
    });
    
    server.bind(MESSAGES.initialized, function() {
        userPanelView.show();
        infoPanelView.show();
    });
    
    server.bind(MESSAGES.noPuzzles, function() {
        titleView.showCreatePuzzleButton();
        userPanelView.hide();
        infoPanelView.hide();
    });

    puzzleModel.once('change', function() {
        piecesCollection.once('refresh', loadPuzzle);
        piecesCollection.fetch();
    });
    
    puzzleModel.bind('change', function() {
        if (puzzleModel.get('completion') >= 100) {
            completeDialog.show();
        }
    });
    
    function loadPuzzle() {
        Puzz.Helpers.Loader({
            viewport: viewport,
            puzzleView: puzzleView,
            puzzleModel: puzzleModel,
            piecesCollection: piecesCollection,
            
            onProgress: function(percent) {
                titleView.loading(percent);
            },
            
            onFinish: function() {
                enablePuzzle();
                puzzleView.buildIndex();
                piecesCollection.fetch();
                titleView.loadingComplete();
            }
        });
    }
    
    function enablePuzzle() {
        puzzleView.bind('leftClick', processClickedPiece);
        puzzleView.bind('rightClick', releaseSelectedPiece);
        
        var scoreBlower = new Puzz.Views.ScoreBlower(userModel, puzzleModel, viewport.puzzle);
        var lockingTooltips = new Puzz.Views.LockingTooltips(puzzleModel, viewport.puzzle);
        var selectionIndicator = new Puzz.Views.SelectionIndicator(viewport.element);

        server.bind(MESSAGES.lockPiece, function(locked) {
            var x = locked.coords[0];
            var y = locked.coords[1];
            var piece = puzzleView.getPiece(x, y);
            
            if (locked.userName == userModel.get('name')) {
                selectionIndicator.show(piece.type());
                selected = piece, selected.select();
            } else {
                lockingTooltips.add(x, y, locked.userName);
                piece.lock();
            }
        });
        
        server.bind(MESSAGES.unlockPiece, function(unlocked) {
            var x = unlocked.coords[0];
            var y = unlocked.coords[1];
            var piece = puzzleView.getPiece(x, y);
            
            if (unlocked.userName == userModel.get('name')) {
                selectionIndicator.hide();
                piece.unselect();
            } else if (_.isUndefined(unlocked.userName)) {
                lockingTooltips.remove(x, y);
                piece.unselect();
                piece.unlock();
            } else {        
                lockingTooltips.remove(x, y);
                piece.unlock();
            }
        });
        
        server.bind(MESSAGES.swapPieces, function(coords) {
            puzzleView.swapPiecesByCoords(coords);
        });
        
        piecesCollection.bind('refresh', function() {
            lockingTooltips.clear();
            
            _.each(piecesCollection.toJSON(), function(pieceData) {
                var x = pieceData.x;
                var y = pieceData.y;
                var piece = puzzleView.getPiece(x, y);
                
                piece.locked = null;
                piece.selected = false;
                piece.highlighted = false;
                piece.removeBorders();
                
                if (pieceData.d == userModel.get('name')) {
                    piece.selected = true;
                    selected = piece;
                } else if (pieceData.d) {
                    piece.locked = true;
                    lockingTooltips.add(x, y, pieceData.d);
                }

                piece.realX = pieceData.realX;
                piece.realY = pieceData.realY;
                piece.render();
            });
        });
    }

    function releaseSelectedPiece() {
        if(selected && selected.selected) {
            server.unlockPiece(selected.x, selected.y);
        }
    }

    function processClickedPiece(piece) {
        if(!piece.locked && !piece.isCollected()) {
            if(piece.selected) {
                server.unlockPiece(piece.x, piece.y);
            } else if(!selected || !selected.selected) {
                server.lockPiece(piece.x, piece.y);
            } else {
                if(puzzleView.isSameType(selected, piece)) {
                    selected.unselect();
                    server.swapPieces(selected.x, selected.y, piece.x, piece.y);
                }
            }
        }
    }

    server.connect();
});

function log(message) {
    if(window.console != null &&
        window.console.log != null) {
        console.log(message);
    }
}
