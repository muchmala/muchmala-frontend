(function() {

var KEYCODE_ENTER = 13;
var KEYCODE_ESC = 27;
    
function Dialog() {
    this.shown = false;
    this.shaking = false;
    this.close = $('<span class="button border close"><em></em></span>');

    this.element = $('<div class="dialog"></div>');
    this.overlay = $('<div class="overlay"></div>');
    this.element.appendTo(document.body);
    this.overlay.appendTo(document.body);
    this.element.append(this.close);

    this.close.click(_.bind(function() {
        this.hide();
    }, this));
}

_.extend(Dialog.prototype, Backbone.Events);

Dialog.EVENTS = {
    shown: 'shown',
    hidden: 'hidden'
};

var DialogProto = Dialog.prototype;

DialogProto.correctPosition = function() {
    this.element.css({
        'margin-top': -Math.floor(this.element.outerHeight() / 2),
        'margin-left': -Math.floor(this.element.outerWidth() / 2)
    });
};

DialogProto.show = function() {
    this.correctPosition();
    this.overlay.fadeIn('fast');
    this.element.fadeIn('fast', _.bind(function() {
        this.shown = true;
        this.trigger('shown');
    }, this));
    
    return this;
};

DialogProto.shake = function() {
    if (this.shaking) {return;}
    
    this.shaking = true;
    var marginLeft = parseInt(this.element.css('margin-left'));
    for(var i = 0, offset = 5; i < 6; i++, offset = -offset) {
        this.element.animate({marginLeft: marginLeft + offset}, 50);
    }
    this.element.animate({marginLeft: marginLeft}, 50, null, _.bind(function() {
        this.shaking = false;
    }, this));
    
    return this;
};

DialogProto.hide = function() {
    this.overlay.fadeOut('fast');
    this.element.fadeOut('fast', _.bind(function() {
        this.shown = false;
        this.trigger('hidden');
    }, this));
    
    return this;
};

function UserNameDialog(model) {
    UserNameDialog.superproto.constructor.call(this);

    this.events = UserNameDialog.EVENTS;
    this.element.append($('#username').show());
    this.input = this.element.find('input');
    this.model = model;
    
    this.input.keyup(_.bind(function(event) {
        if (event.keyCode == KEYCODE_ESC) {this.hide();return;}
        if (event.keyCode != KEYCODE_ENTER) {return;}

        this.element.find('.error').hide();
        this.element.addClass('loading');
        
        model.save({'name': this.input.val()}, {silent: true});
    }, this));

    this.model.bind('saved', _.bind(function() {
        this.element.removeClass('loading');
        this.hide();
    }, this));
    
    this.model.bind('error', _.bind(function(model, error) {
        this.element.find('.error.' + error).show();
        this.element.removeClass('loading');
        this.shake();
    }, this));
}

Puzz.Utils.inherit(UserNameDialog, Dialog);

var UserNameDialogProto = UserNameDialog.prototype;

UserNameDialogProto.show = function() {
    UserNameDialog.superproto.show.call(this);
    this.input.val(this.model.get('name'));
    this.input.focus();
};

UserNameDialogProto.hide = function() {
    UserNameDialog.superproto.hide.call(this);
    this.input.blur();
};

function TwentyDialog(collection) {
    TwentyDialog.superproto.constructor.call(this);
    
    this.collection = collection;
    this.element.append($('#twenty').show());
    this.viewport = this.element.find('.leaders');
    
    this.viewport.viewport({position: 'top'});
    this.viewport.viewport('content').scraggable({axis: 'y', containment: 'parent'});
    this.viewport.scrolla({content: this.viewport.viewport('content')});
    
    var self = this;

    this.collection.bind('refresh', function() {
        self.updateTopTwenty();
        self.viewport.viewport('update');
        self.viewport.scrolla('update');
        self.viewport.removeClass('loading');
    });
}

Puzz.Utils.inherit(TwentyDialog, Dialog);

var TwentyDialogProto = TwentyDialog.prototype;

TwentyDialogProto.show = function() {
    TwentyDialog.superproto.show.call(this);
    this.viewport.addClass('loading');
    this.collection.fetch();
};

TwentyDialogProto.updateTopTwenty = function() {
    var list = this.viewport.find('ul').empty();
    var users = this.collection.toJSON();
    
    for(var i = 0; i < users.length; i++) {
        var user = users[i];
        var row = '<li>' +
            '<span class="num">' + (i + 1) + '.</span>' +
            '<span class="name">' + user.name + '</span>' +
            '<span class="time">' + Puzz.TimeHelper.diffString(user.created) + '</span>' +
            '<span class="score">' + user.score + '</span>' +
        '</li>';

        list.append(row);
    }
};

function AboutDialog() {
    AboutDialog.superproto.constructor.call(this);
    
    this.element.append($('#about').show());
    
    this.tabs = {};
    this.pages = {};

    var self = this;

    this.element.find('.tabs li').each(function() {
        self.tabs[$(this).data('page')] = $(this);
    });
    this.element.find('.page').each(function() {
        self.pages[$(this).data('name')] = $(this);
    });

    _.each(this.tabs, function(tab) {
        tab.click(function() {
            self.openPage(tab.data('page'));
        });
    });
}

Puzz.Utils.inherit(AboutDialog, Dialog);

var AboutDialogProto = AboutDialog.prototype;

AboutDialogProto.openPage = function(pageName) {
    _.each(this.tabs, function(tab) {tab.removeClass('sel');});
    _.each(this.pages, function(page) {page.hide();});

    this.tabs[pageName].addClass('sel');
    this.pages[pageName].show();
};

function CompleteDialog(puzzle, leaders) {
    CompleteDialog.superproto.constructor.call(this);
    this.element.append($('#complete').show());
    this.leaders = leaders;
    this.puzzle = puzzle;

    this.leadersShow = 'score';
    this.closed = false;

    var self = this;

    this.element.find('.button.sort').toggle(
        function() {
            self.leadersShow = 'found';
            self.updateLeadersBoard();
            $(this).html('by ' + self.leadersShow);
        },
        function() {
            self.leadersShow = 'score';
            self.updateLeadersBoard();
            $(this).html('by ' + self.leadersShow);
        });

    this.element.find('.button.big').click(function() {
        window.location.href = '/';
    });

    this.puzzle.bind('change', function() {
        if (_.isUndefined(self.puzzle.get('completed'))) {return;}
        
        var data = self.puzzle.toJSON();
        var creationTime = +(new Date(data.created));
        var completionTime = +(new Date(data.completed));
        var timeSpent = Puzz.TimeHelper.diffHoursMinutes(creationTime, completionTime);
        
        self.element.find('.pieces .value').html(data.vLength * data.hLength);
        self.element.find('.participants .value').html(data.participants);
        self.element.find('.timespent .value').html(timeSpent);
        self.element.find('.swaps .value').html(data.swaps);
    });

    this.leaders.bind('refresh', function() {
        self.updateLeadersBoard();
    });
}

Puzz.Utils.inherit(CompleteDialog, Dialog);

var CompleteDialogProto = CompleteDialog.prototype;

CompleteDialogProto.hide = function() {
    CompleteDialog.superproto.hide.call(this);
    this.closed = true;
};

CompleteDialogProto.updateLeadersBoard = function() {
    var leadersBoard = this.element.find('.leaders').empty();
    var leadersData = this.leaders.getSortedBy(this.leadersShow);

    for(var i = leadersData.length, num = 1; i > 0 && num < 6; i--) {
        var data = leadersData[i-1].toJSON();
        var row = $('<li></li>');

        row.append('<span class="num">' + (num++) + '.</span>');
        row.append('<span class="name">' + data.name + '</span>');
        row.append('<span class="dots"></span>');
        row.append('<span class="score">' + data[this.leadersShow] + '</span>');
        row.appendTo(leadersBoard);
    }
};

function AuthDialog(user, signup) {
    AuthDialog.superproto.constructor.call(this);
    this.element.append($('#auth').show());
    this.signup = signup;
    this.user = user;
    
    var self = this;
    
    _.bindAll(this.signup, 'show');
    _.bindAll(this, 'show', 'login');
    
    this.element.find('.signin').click(this.login);
    this.element.find('.create').click(function() {
        self.once('hidden', self.signup.show);
        self.hide();
    });
    
    this.signup.bind('goback', function() {
        self.signup.once('hidden', self.show);
        self.signup.hide();
    });
    
    this.element.find('input[name="username"]').keyup(onKeyUp);
    this.element.find('input[name="password"]').keyup(onKeyUp);
    
    function onKeyUp(event) {
        if (event.keyCode == KEYCODE_ESC) {self.hide();return;}
        if (event.keyCode != KEYCODE_ENTER) {return;}
        self.login();
    }
}

Puzz.Utils.inherit(AuthDialog, Dialog);

var AuthDialogProto = AuthDialog.prototype;

AuthDialogProto.show = function() {
    AuthDialog.superproto.show.call(this);
    this.reset();
};

AuthDialogProto.reset = function() {
    this.element.find('.error').hide();
    this.element.find('form').get(0).reset();
    this.element.find('input[name="username"]').focus();
};

AuthDialogProto.login = function() {
    var username = this.element.find('input[name="username"]').val();
    var password = this.element.find('input[name="password"]').val();
    var correct = true;
    
    this.element.find('.error').hide();
    
    if (!username) {
        this.element.find('.usernameEmpty').show();
        correct = false;
    } else if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
        this.element.find('.usernameIncorrect').show();
        correct = false;
    }
    
    if (!password) {
        this.element.find('.passwordEmpty').show();
        correct = false;
    }
    
    if (!correct) {
        this.shake();
        return;
    }
    
    this.element.find('.signin').hide();
    this.element.find('.loading').show();
    
    var self = this;
    
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: '/auth/form',
        data: {
            username: username,
            password: password
        },
        success: function(response){
            self.element.find('.signin').show();
            self.element.find('.loading').hide();
            
            if (!_.isUndefined(response.errors)) {
                _.each(response.errors, function(error) {
                    self.element.find('.error.' + error).show();
                });
            } else if (response == 'failed'){
                self.element.find('.error.failed').show();
            } else if (response == 'success') {
                self.user.socket.reconnect();
                self.hide();
            }
        }
    });
};

function SignupDialog(user) {
    SignupDialog.superproto.constructor.call(this);
    this.element.append($('#signup').show());
    this.user = user;
    
    var self = this;
    
    _.bindAll(this, 'signup', 'hide');
    
    this.element.find('.finish .button').click(this.hide);
    this.element.find('form .button').click(this.signup);
    this.element.find('form .goback').click(function() {
        self.trigger('goback');
    });
    
    this.element.find('input[name="username"]').keyup(onKeyUp);
    this.element.find('input[name="password"]').keyup(onKeyUp);
    this.element.find('input[name="repeat"]').keyup(onKeyUp);
    this.element.find('input[name="email"]').keyup(onKeyUp);
    
    function onKeyUp(event) {
        if (event.keyCode == KEYCODE_ESC) {self.hide();return;}
        if (event.keyCode != KEYCODE_ENTER) {return;}
        self.signup();
    }
}

Puzz.Utils.inherit(SignupDialog, Dialog);

var SignupDialogProto = SignupDialog.prototype;

SignupDialogProto.show = function() {
    SignupDialog.superproto.show.call(this);
    this.reset();
};

SignupDialogProto.reset = function() {
    this.element.find('.error').hide();
    this.element.find('form').get(0).reset();
    this.element.find('input[name="username"]').focus();
    this.element.find('input[name="username"]').val(this.user.get('name'));
};

SignupDialogProto.signup = function() {
    var username = this.element.find('input[name="username"]').val();
    var password = this.element.find('input[name="password"]').val();
    var repeat = this.element.find('input[name="repeat"]').val();
    var email = this.element.find('input[name="email"]').val();
    var correct = true;
    
    this.element.find('.error').hide();
    
    if (!username) {
        this.element.find('.usernameEmpty').show();
        correct = false;
    } else if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
        this.element.find('.usernameIncorrect').show();
        correct = false;
    }
    
    if (!email) {
        this.element.find('.emailEmpty').show();
        correct = false;
    } else if (!/^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email)) {
        this.element.find('.emailIncorrect').show();
        correct = false;
    }
    
    if (!password) {
        this.element.find('.passwordEmpty').show();
        correct = false;
    }
    
    if (!repeat) {
        this.element.find('.repeatEmpty').show();
        correct = false;
    } else if (password != repeat) {
        this.element.find('.repeatDoesntMatch').show();
        correct = false;
    }
    
    if (!correct) {
        this.shake();
        return;
    }
    
    this.element.find('.buttons').hide();
    this.element.find('.loading').show();
    
    var self = this;
    
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: '/auth/signup',
        data: {
            username: username,
            password: password,
            email: email
        },
        success: function(response){
            if (!_.isUndefined(response.errors)) {
                _.each(response.errors, function(error) {
                    self.element.find('.error.' + error).show();
                });
                self.element.find('.buttons').show();
                self.element.find('.loading').hide();
            } else {
                self.element.find('form').hide();
                self.element.find('.finish').show();
                self.correctPosition();
                self.user.socket.reconnect();
            }
        }
    });
};

function CreatePuzzleDialog() {
    CreatePuzzleDialog.superproto.constructor.call(this);
    this.element.append($('#createPuzzle').show());
    
    _.bindAll(this, 'submit', 'reset');

    this.fatal = this.element.find('.fatal');
    this.fatal.find('.button').click(this.reset);
    
    this.success = this.element.find('.success');
    
    this.form = this.element.find('form');
    this.form.find('.button.big').click(this.submit);
    this.form.find('.uploading').hide();
    this.form.find('.error').hide();
}

Puzz.Utils.inherit(CreatePuzzleDialog, Dialog);

var CreatePuzzleDialogProto = CreatePuzzleDialog.prototype;

CreatePuzzleDialogProto.show = function() {
    CreatePuzzleDialog.superproto.show.call(this);
    this.reset();
};

CreatePuzzleDialogProto.reset = function() {
    this.form.find('.error').hide();
    this.form.show().get(0).reset();
    this.fatal.hide();
    this.success.hide();
};

CreatePuzzleDialogProto.submit = function() {
    var file = this.form.find('input[name="image"]');
    var name = this.form.find('input[name="name"]');
    var correct = true;
    
    this.form.find('.error').hide();
    
    if (!name.val()) {
        this.form.find('.error.nameAbsent').show();
        correct = false;
    }
    if (!file.val()) {
        this.form.find('.error.imageAbsent').show();
        correct = false;
    }
    if (file.get(0).files[0] &&
        file.get(0).files[0].type != 'image/jpeg' &&
        file.get(0).files[0].type != 'image/png') {
        this.form.find('.error.imageFormat').show();
        correct = false;
    }
    
    if (!correct) {
        this.shake();
        return;
    }
    
    var self = this;
    
    AIM.submit(this.form.get(0), {
        onStart: function() {
            self.form.find('.button.big').hide();
            self.form.find('.uploading').show();
        },
        onComplete: function(response) {
            if (!_.isUndefined(response.errors)) {
                if (_.include(response.errors, 'fatal')) {
                    self.form.hide();
                    self.fatal.show();
                    self.correctPosition();
                }
                _.each(response.errors, function(error) {
                    self.form.find('.error.' + error).show();
                });
                
                self.form.find('.button.big').show();
                self.form.find('.uploading').hide();
            } else {
                self.form.hide();
                self.success.show();
                self.correctPosition();
                self.success.find('.index').html(response.queueIndex);
                self.success.find('a').attr('href', '#' + response.puzzleId);
                self.success.find('a').click(function() {
                    document.location.href = '#' + response.puzzleId;
                    document.location.reload();
                    return;
                });
            }
        }
    });
};

Puzz.TimeHelper = {
    MONTH: 60*60*24*30,
    DAY: 60*60*24,
    HOUR: 60*60,
    MINUTE: 60,
    
    getMonthes: function(time) {
        return Math.floor(time / this.MONTH);
    },
    getDays: function(time) {
        return Math.floor(time / this.DAY);
    },
    getHours: function(time) {
        return Math.floor(time / this.HOUR);
    },
    getMinutes: function(time) {
        return Math.floor(time / this.MINUTE);
    },
    diffString: function(creationTime) {
        var creationDate = new Date(creationTime);
        var diff = Math.floor((new Date() - creationDate.getTime()) / 1000);
        var monthes, days, hours, minutes;
        var result = '';

        if (diff >= this.MONTH) {
            monthes = this.getMonthes(diff);
            result = monthes + (monthes > 1 ? ' monthes' : ' month');
        } else if (diff >= this.DAY) {
            days = this.getDays(diff);
            result = days + (days > 1 ? ' days' : ' day');
        } else if (diff >= this.HOUR) {
            hours = this.getHours(diff);
            result = hours + (hours > 1 ? ' hours' : ' hour');
        } else if (diff >= this.MINUTE) {
            minutes = this.getMinutes(diff % this.HOUR);
            result = minutes + (minutes > 1 ? ' minutes' : ' minute');
        } else {
            result = 'just now';
        }

        return result;
    },

    diffHoursMinutes: function(startTime, finishTime) {
        finishTime = finishTime || new Date();
        
        var diff = Math.floor((finishTime - startTime) / 1000);
        var hours = Math.floor(diff / 3600);
        var minutes = Math.floor((diff % 3600) / 60);

        if((hours+'').length == 1) {
            hours = '0' + hours;
        }
        if((minutes+'').length == 1) {
            minutes = '0' + minutes;
        }
        return hours + ':' + minutes;
    }
};

Puzz.Views.AboutDialog = AboutDialog;
Puzz.Views.TwentyDialog = TwentyDialog;
Puzz.Views.UserNameDialog = UserNameDialog;
Puzz.Views.CompleteDialog = CompleteDialog;
Puzz.Views.CreatePuzzleDialog = CreatePuzzleDialog;
Puzz.Views.AuthDialog = AuthDialog;
Puzz.Views.SignupDialog = SignupDialog;

})();