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
        this.el.find('.progressbar').hide();
        this.el.find('.play').show();
    },
    
    showCreatePuzzleButton: function() {
        this.el.find('.progressbar').hide();
        this.el.find('.create').show();
    },
    
    showCreateDialog: function() {
        this.createDialog.show();
    },
    
    hide: function() {
        this.el.fadeOut('fast');
    }
});