(function() {

var UserPanel = Backbone.View.extend({

    el: $('nav.user'),

    initialize: function() {
        var aboutDialog = new Puzz.Views.AboutDialog();
        var userNameDialog = new Puzz.Views.UserNameDialog(this.model);
        var signupDialog = new Puzz.Views.SignupDialog(this.model);
        var authDialog = new Puzz.Views.AuthDialog(this.model, signupDialog);
        
        this.el.find('.name').click(function() {
            if(!userNameDialog.shown) userNameDialog.show();
        });
        this.el.find('.auth').click(function() {
            if(!authDialog.shown && !signupDialog.shown) {
                authDialog.show();
            } 
        });
        this.el.find('.about').click(function() {
            if (!aboutDialog.shown) aboutDialog.show();
        });
        
        var self = this;
                
        this.model.bind('change', function() {
            self.el.find('.num').text(self.model.get('score'));
            self.el.find('.name').text(self.model.get('name'));
            
            if (self.model.get('anonymous')) {
                self.el.find('.auth').show();
                self.el.find('.logout').hide();
            } else {
                self.el.find('.auth').hide();
                self.el.find('.logout').show();
            }
        });
        
        this.model.bind('change:score', function() {
            self.el.find('.num').text(self.model.get('score'));
        });
    },
    
    show: function() { this.el.show(); },
    hide: function() { this.el.hide(); }
});

Puzz.Views.UserPanel = UserPanel;

var InfoPanel = Backbone.View.extend({

    el: $('nav.info'),

    initialize: function(stngs) {        
        var twentyDialog = new Puzz.Views.TwentyDialog(stngs.twentyCollection);
        var leadersView = new LeadersView({collection: stngs.leadersCollection});
        var self = this;
        
        stngs.puzzleModel.bind('change', function(data) {
            self.el.find('.connected').text(stngs.puzzleModel.get('connected'));
        });
        this.el.find('.openMenu').click(function() {
            if (!twentyDialog.shown) twentyDialog.show();
        });
        this.el.find('.createPuzzle').click(function() {
            if (!stngs.createDialog.shown) stngs.createDialog.show();
        });
        this.el.find('.expcol').toggle(function() {
            self.el.addClass('collapsed');
            leadersView.el.find('.button').hide();
            leadersView.vp.hide();
        }, function() {
            self.el.removeClass('collapsed');
            leadersView.el.find('.button').show();
            leadersView.vp.show();
            leadersView.render();
        });        
    },
    
    show: function() { this.el.show(); },
    hide: function() { this.el.hide(); }
});

Puzz.Views.InfoPanel = InfoPanel;

var LeadersView = Backbone.View.extend({
    
    el: $('nav .leadersboard'),
    vp: $('nav .leadersboard .viewport'),
    
    events: {
        'click .button': 'resort'
    },
    
    shows: 'score',
    
    initialize: function() {
        this.vp.viewport({position: 'top'});
        this.vp.viewport('content').scraggable({axis: 'y', containment: 'parent'});
        
        _.bindAll(this, 'render', 'show');
        this.collection.once('refresh', this.show);
        this.collection.bind('refresh', this.render);
    },
    
    resort: function() {
        this.shows = this.shows == 'score' ? 'found' : 'score';
        this.el.find('.button').html(this.shows);
        this.render();
    },
    
    render: function() {
        var count = this.collection.length;
        if(count > 0) {
            var list = this.collection.getSortedBy(this.shows);
            var viewport = this.vp.find('.list').empty();
            
            for(var i = count; i > 0; i--) {
                var data = list[i-1].toJSON();
                var row = $('<em></em>');

                row.append('<span class="status ' + (data.online ? 'online' : 'offline') + '"></span>');
                row.append('<span class="name">' + data.name + '</span>');
                row.append('<span class="num">' + data[this.shows] + '</span>');
                row.appendTo(viewport);
            }
            this.vp.height(row.height() * (count < 10 ? count : 10));
        }
        this.vp.viewport('update');
    },
    
    show: function() { this.el.show(); },
    hide: function() { this.el.hide(); } 
});

/*var StatisticsView = Backbone.View.extend({
    
    el: $('nav .statistics'),
        
    initialize: function() {
        _.bindAll(this, 'render', 'startTimer', 'show');
        
        this.model.once('change', this.show);
        this.model.bind('change', this.render);
        this.model.once('change', this.startTimer);
    },
    
    render: function() {
        var data = this.model.toJSON();
        this.el.find('.swaps').text(data.swaps);
        this.el.find('.connected').text(data.connected);
        this.el.find('.complete').text(data.completion + '%');
        this.el.find('.quantity').text(data.vLength * data.hLength);
    },
    
    startTimer: function() {
        var data = this.model.toJSON();
        this.updateTimeSpent(data.created, data.completed);
        setInterval(_.bind(function() {
            this.updateTimeSpent(data.created, data.completed);
        }, this), 6000);
    },
    
    updateTimeSpent: function(creationTime, completionDate) {
        this.el.find('.timeSpent').text(Puzz.TimeHelper.diffHoursMinutes(creationTime, completionDate));
    },
    
    show: function() { this.el.show(); },
    hide: function() { this.el.hide(); }
    
});*/

})();