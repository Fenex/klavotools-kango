angular.module('popup', [
    'popup.menutree',
    'popup.redirect',
    'popup.fl-editor',
    'fnx.kango-q'
])
.config(function($httpProvider, $compileProvider) {
    // Use x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome|chrome-extension):/);

    /**
     * The workhorse; converts an object to x-www-form-urlencoded serialization.
     * @param {Object} obj
     * @return {String}
     */
    var param = function(obj) {
        var query = '',
            name, value, fullSubName, subName, subValue, innerObj, i;

        for (name in obj) {
            value = obj[name];

            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            } else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            } else if (value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
})

.directive('ngPath', function (Redirect, RedirectMode, $timeout) {
    return {
        restrict: 'A',
        scope: {
            ngPath: '='
        },
        link: function (scope, element, attrs) {
            var url = scope.ngPath || attrs.ngPathStr;
            element.on('click auxclick', function(event) {
                event.stopPropagation();
                return event.button === 1 ? Redirect(url, RedirectMode.BACKGROUND) : Redirect(url);
            });
        }
    }
})

.directive('keyboardControlledList', function () {
    function sibling (dir, element) {
        var res = element[dir + 'Sibling'];
        while(res && res.nodeType != 1) {
            res = res[dir + 'Sibling'];
        }
        return res || element;
    }
    return {
        restrict: 'A',
        link: function (scope, element) {
            var active = null;
            element.on('focus', function (event) { active = this; });
            element.on('keydown', function (event) {
                // Up arrow:
                if (event.keyCode === 38) {
                    return sibling('previous', active).focus();
                }
                // Down arrow:
                if (event.keyCode === 40) {
                    return sibling('next', active).focus();
                }
                // Enter or Space:
                if (event.keyCode === 13 || event.keyCode === 32) {
                    return active.click();
                }
            });
        }
    }
})

.directive('mainMenu', function() {
    return {
        restrict: 'A',
        templateUrl: 'mainMenuTemplate',
        replace: false,
        controller: function($scope, MenuTree) {
            $scope.menu = MenuTree;

            $scope.toggleEditor = function() {
                $scope.$broadcast('toggle-editor');
            };

            $scope.$on('save-links', loadFL);

            function loadFL() {
                $scope.links = kango.storage.getItem('fast-links') || [];
            }
            loadFL();
        }
    }
})

.filter('prettyDateTime', function () {
    return function (seconds) {
        var date = new Date(seconds);
        var diff = (Date.now() - seconds) / 1000;
        var day_diff = Math.floor(diff / 86400);

        var time = date.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        var dayOfWeek = date.toLocaleString('ru-RU', { weekday: 'short' });
        var dayMonth = date.toLocaleString('ru-RU', { day: 'numeric', month: 'short' });
        var year = date.getFullYear();

        if (day_diff === 0) {
            return time;
        }
        if (day_diff === 1) {
            return 'Вчера, ' + time;
        }
        if (day_diff < 7) {
            return dayOfWeek + ', ' + time;
        }
        return dayMonth + (year === (new Date()).getFullYear() ? '' : year) + ', ' + time;
    };
})

.filter('avatar', function () {
    return function (id, hasAvatar, size) {
        var url;
        if (hasAvatar) {
            url = 'http://i.klavogonki.ru/avatars/' + id;
            url += size === 'small' ? '.png' : '_big.png';
        } else {
            url = 'http://klavogonki.ru/img/';
            url += size === 'small' ? 'avatar_dummy_16.png' : 'avatar_dummy.gif';
        }
        return url;
    };
})

.controller('popup:SearchUser', function ($scope, $http, $q) {
    var ctrl = this;

    ctrl.login = '';
    ctrl.id = 0;
    ctrl.loading = false;

    ctrl.search = function() {
        ctrl.loading = true;
        ctrl.id = 0;
        ctrl.actualLogin = '';
        ctrl.totalRacesCount = '';
        ctrl.friendsCount = '';
        ctrl.recordDefault = '';
        ctrl.hasAvatar = undefined;
        ctrl.blocked = false;

        function getSummary (userId) {
            return $http.get('http://klavogonki.ru/api/profile/get-summary', {
                params: { id: userId },
            });
        }

        function getIndexData (userId) {
            return $http.get('http://klavogonki.ru/api/profile/get-index-data', {
                params: { userId: userId },
            });
        }

        $http.post('http://klavogonki.ru/.fetchuser?KTS_REQUEST', {login: ctrl.login})
        .then(function (res) {
            ctrl.id = res.data.id;
            return $q.all([getSummary(ctrl.id), getIndexData(ctrl.id)]);
        })
        .then(function (res) {
            // TODO: write decorator $q.spread?
            var summary = res[0];
            var index = res[1];
            ctrl.actualLogin = summary.data.user.login;
            ctrl.hasAvatar = !!summary.data.user.avatar;
            ctrl.rank = summary.data.level;
            ctrl.blocked = summary.data.blocked;
            ctrl.achievementsCount = index.data.stats.achieves_cnt;
            ctrl.totalRacesCount = index.data.stats.total_num_races;
            ctrl.friendsCount = index.data.stats.friends_cnt;
            ctrl.recordDefault = index.data.stats.best_speed;
            ctrl.loading = false;
        })
        .catch(function (err) {
            console.error(err);
            ctrl.loading = false;
        });
    };
})

.controller('popup:Mail', function ($scope, $http) {
    var ctrl = this;
    ctrl.data = {};
    var hide = kango.storage.getItem('popup_hideReadMessages');
    hide = typeof hide === 'boolean' ? hide : true;
    $scope.hideReadMessages = hide;
    $scope.saveSettings = function (name) {
        kango.storage.setItem('popup_' + name, $scope[name]);
    };

    $http.get('http://klavogonki.ru/api/profile/get-messages-contacts?KTS_REQUEST')
    .then(function (res) {
        if (res.status == 200) {
            var messages = res.data.messages.map(function (message) {
                message.respondentLogin = res.data.users[message.respondent_id].login;
                message.hasAvatar = !!res.data.users[message.respondent_id].avatar;
                return message;
            });
            ctrl.messages = messages;
        }
    });
});

KangoAPI.onReady(function() {
    function resize () {
        KangoAPI.resizeWindow(document.documentElement.scrollWidth, document.documentElement.scrollHeight)
    }
    // Fix for the FireFox:
    resize();
    window.addEventListener('overflow', resize, false);
    angular.bootstrap(document.body, ['popup']);
});
