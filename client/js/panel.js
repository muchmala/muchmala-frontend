Puzz.Panel = (function() {
    var element = $('nav');
    var observer = Utils.Observer();

    element.draggable({containment: 'parent'});

    var userNameDialog = new Puzz.UserNameDialog();
    userNameDialog.on('entered', function(value) {
        observer.fire('userNameChanged', value);
    });

    element.find('.user .name').click(function(event) {
        if(userNameDialog.shown) { return; }
        userNameDialog.show();
    });
    element.find('header h1').click(function() {
        if (Puzz.MenuDialog.shown) { return; }
        Puzz.MenuDialog.show();
    });
    element.find('.expcol').click(function() {
        if($(this).hasClass('opened')) {
            self.collapse()
        } else {
            self.expand();
        }
    });

    Puzz.Server.subscribe(MESSAGES.piecesData, function() {
        element.removeClass('loading');
    });

    var self = {
        on: observer.on,

        expand: function() {
            element.find('header').show();
            element.find('.statistics').show();
            element.find('.leadersboard').show();
            element.find('.expcol').addClass('opened');
        },
        collapse: function() {
            element.find('header').hide();
            element.find('.statistics').hide();
            element.find('.leadersboard').hide();
            element.find('.expcol').removeClass('opened');
        },

        loading: function() {
            element.addClass('loading');
        },
        
        setUserData: function(data) {
            element.find('.expcol').show();
            element.find('.user .num').text(data.score);
            element.find('.user .name').text(data.name);
            element.addClass('filled');
        },
        setPuzzleData: function(data) {
            this.setCompleteLevel(data.completion);
            this.setConnectedUsersCount(data.connected);
            element.find('.statistics .quantity').text(data.vLength * data.hLength);

            var creationDate = new Date(data.created);
            this.updateTimeSpent(creationDate.getTime());
            setInterval(_.bind(function() {
                this.updateTimeSpent(creationDate);
            }, this), 60000);
        },
        setConnectedUsersCount: function(count) {
            element.find('.statistics .connected').text(count);
        },
        setCompleteLevel: function(percent) {
            element.find('.statistics .complete').text(percent + '%');
        },
        
        updateTimeSpent: function(creationTime) {
            var diff = parseInt((new Date() - creationTime) / 1000);
            var hours = parseInt(diff / 3600);
            var minutes = parseInt((diff % 3600) / 60);

            if((hours+'').length == 1) {
                hours = '0' + hours;
            }
            if((minutes+'').length == 1) {
                minutes = '0' + minutes;
            }
            element.find('.statistics .timeSpent').text(hours + ':' + minutes);
        },
        updateLeadersBoard: function(usersData) {
            if(usersData.length == 0) { return; }

            var leadersBoard = element.find('.leadersboard ul').empty();

            for(var i = usersData.length; i > 0; i--) {
                var row = $('<li></li>')
                var status = 'offline';
                if(usersData[i-1].online) {
                    status = 'online';
                }
                row.append('<span class="status ' + status + '"></span>');
                row.append('<span class="name">' + usersData[i-1].name + '</span>');
                row.append('<span class="num">' + usersData[i-1].score + '</span>');
                row.appendTo(leadersBoard);
            }
        }
    };

    return self;
})();