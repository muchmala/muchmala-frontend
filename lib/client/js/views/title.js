Puzz.Views.TitleView = Backbone.View.extend({
    el: $('#title'),
    
    events: {
        'click .play': 'hide',
        'click .create': 'showCreateDialog',
    },
    
    initialize: function(createDialog) {
        this.createDialog = createDialog;
    },
    
    loading: function(percent) {
        this.el.find('.progressbar em').css('width', percent + '%');
        this.el.find('.progressbar span').html(percent + '%');
        this.el.find('.progressbar span').removeClass('loading');
    },

    loadingComplete: function() {
        this.el.find('.progressbar').fadeOut('fast', _.bind(function() {
            this.el.find('.play').fadeIn('fast');
        }, this));
    },
    
    showCreatePuzzleButton: function() {
        this.el.find('.progressbar').fadeOut('fast', _.bind(function() {
            this.el.find('.create').fadeIn('fast');
        }, this));
    },
    
    showCreateDialog: function() {
        this.createDialog.show();
    },
    
    hide: function() {
        this.el.fadeOut('fast');
    }
});