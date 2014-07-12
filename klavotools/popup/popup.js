angular.module('popup', [
    'popup.menutree',
    'popup.redirect'
])
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
.directive('uiCssMenu', function(MenuTree) {
    return {
        restrict: 'A',
        template: '\
            <ul>\
                <li ng:repeat="m in menu" ng:class="{\'has-sub\': m.sub}" ng:hide="m.hidden">\
                    <a ng:style="{color: m.color}" ng:path="m.path">{{m.title}}</a>\
                    <ul>\
                        <li ng:repeat="sub in m.sub">\
                            <a ng:path="sub.path">{{sub.title}}</a>\
                        </li>\
                    </ul>\
                </li>\
            </ul>',
        replace: false,
        link: function(scope, element, attrs) {
            scope.menu = MenuTree;
        }
    }
})
.controller('searchUser', function($scope) {
    $scope.login = '';
    $scope.id = 0;
    $scope.loading = false;
    
    $scope.search = function() {
        $scope.loading = true;
        $scope.id = 0;
        kango.xhr.send({
                method: 'POST',
                url: 'http://klavogonki.ru/.fetchuser',
                params: {
                    login: $scope.login
                }
            },
            function(data) {
                if (data.status == 200 && data.response != null) {
                    $scope.id = JSON.parse(data.response).id;
                } else {
                    //kango.console.log('something went wrong');
                }
                $scope.loading = false;
                $scope.$apply();
            }
        );
    };
});

KangoAPI.onReady(function() {
    angular.bootstrap(document.body, ['popup']);
});