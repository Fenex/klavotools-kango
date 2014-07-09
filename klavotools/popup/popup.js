angular.module('popup', [])
.directive('uiCssmenu', function() {
    return {
        restrict: 'A',
        template: '<ul ng:repeat="m in menu">{{m.title}}</ul>',
        replace: false,
        link: function(scope, element, attrs) {
            scope.menu = [
                {
                    title: 'title',
                    url: 'http://klavogonki.ru/',
                    sub: [
                        {
                            title: 'sub-title',
                            url: 'http://klavogonki.ru/sub/'
                        }
                    ]
                }
            ];
        },
        controller: function($scope) {

        }
    }
});

KangoAPI.onReady(function() {
    angular.bootstrap(document.getElementById('cssmenu-new'), ['popup']);
});