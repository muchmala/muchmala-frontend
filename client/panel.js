Puzzle.Panel = function panel(element) {
    var observer = Utils.Observer();
    observer.register(panel.events.userNameChanged);
    element.show();
    
    $('.expcol', element).click(function() {
        if($('.expcol', element).hasClass('opened')) {
            $('.logo', element).hide();
            $('.statistics', element).hide();
            $('.leadersboard', element).hide();
            $('.expcol', element).removeClass('opened');
        } else {
            $('.logo', element).show();
            $('.statistics', element).show();
            $('.leadersboard', element).show();
            $('.expcol', element).addClass('opened');
        }
    });

    var userNameDialog = Puzzle.UserNameDialog();
    var userNameElement = element.find('.user .name');

    userNameElement.click(function(event) {
        if(!userNameDialog.shown) {
            userNameDialog.show();
        }
    });

    userNameDialog.subscribe(Puzzle.UserNameDialog.events.entered, function(value) {
        observer.userNameChanged(value);
    });

    function setUsername(name) {
        userNameElement.text(name);
    }

    function setScore(score) {
        element.find('.user .num').text(score);
    }

    function setConnectedUsersCount(count) {
        element.find('.statistics .connected').text(count);
    }

    function setCompleteLevel(percent) {
        element.find('.statistics .complete').text(percent+'%');
    }

    function setTimeSpent(createdAtTime) {
        updateTimeSpent(createdAtTime);

        setInterval(function() {
            updateTimeSpent(createdAtTime);
        }, 60000);
    }

    function updateTimeSpent(createdAtTime) {
        var diff = parseInt((+(new Date()) - createdAtTime) / 1000);
        var hours = parseInt(diff / 3600);
        var minutes = parseInt((diff % 3600) / 60);

        if((hours+'').length == 1) {
            hours = '0' + hours;
        }

        if((minutes+'').length == 1) {
            minutes = '0' + minutes;
        }

        element.find('.statistics .timeSpent').text(hours + ':' + minutes);
    }

    return {
        subscribe: observer.subscribe,
        setConnectedUsersCount: setConnectedUsersCount,
        setCompleteLevel: setCompleteLevel,
        setUsername: setUsername,
        setTimeSpent: setTimeSpent,
        setScore: setScore
    }
};

Puzzle.Panel.events = {
    userNameChanged: 'userNameChanged'
};