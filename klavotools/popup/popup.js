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

.directive('ngPath', function(Redirect, RedirectMode, $timeout) {
    return {
        restrict: 'A',
        scope: {
            ngPath: '='
        },
        link: function(scope, element, attrs) {
            var url = scope.ngPath || attrs.ngPathStr;
            var mode = RedirectMode.UNDEFINED;
            var timer = null;
            element.on('click', function(event) {
                if(event.button==1) {
                    mode = RedirectMode.UNDEFINED;
                    Redirect(url, RedirectMode.BACKGROUND);
                    return;
                }
                mode++;
                if(!timer) {
                    timer = $timeout(function() {
                        Redirect(url, mode);
                        mode = RedirectMode.UNDEFINED;
                        timer = null;
                    }, 300);
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

            $scope.openEditor = function() {
                $scope.$broadcast('open-editor');
            };

            $scope.$on('save-links', loadFL);

            function loadFL() {
                $scope.links = kango.storage.getItem('fast-links') || [];
            }
            loadFL();
        }
    }
})

.controller('popup:SearchUser', function($scope, $http) {
    var ctrl = this;

    ctrl.login = '';
    ctrl.id = 0;
    ctrl.loading = false;

    ctrl.search = function() {
        ctrl.loading = true;
        ctrl.id = 0;

        $http.post('http://klavogonki.ru/.fetchuser?KTS_REQUEST', {login: ctrl.login})
        .then(function(res) {
            ctrl.id = res.data.id;
            ctrl.loading = false;
        });
    };
})

.controller('popup:Mail', function($http) {
    var ctrl = this;

    ctrl.data = {};

    $http.get('http://klavogonki.ru/api/profile/get-messages-contacts?KTS_REQUEST')
    .then(function(res) {
        if(res.status == 200)
            ctrl.data = res.data;
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
