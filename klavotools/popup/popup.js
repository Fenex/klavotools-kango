angular.module('popup', [
    'popup.menutree',
    'popup.redirect',
    'popup.fl-editor'
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

.directive('uiCssMenu', function() {
    return {
        restrict: 'A',
        templateUrl: 'uiCssMenu_Template',
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

.controller('popup:SearchUser', function($scope) {
    var ctrl = this;
    
    ctrl.login = '';
    ctrl.id = 0;
    ctrl.loading = false;
    
    ctrl.search = function() {
        ctrl.loading = true;
        ctrl.id = 0;
        kango.xhr.send({
                method: 'POST',
                url: 'http://klavogonki.ru/.fetchuser',
                params: {
                    login: ctrl.login
                }
            },
            function(data) {
                if (data.status == 200 && data.response != null) {
                    ctrl.id = JSON.parse(data.response).id;
                } else {
                    //kango.console.log('something went wrong');
                }
                ctrl.loading = false;
                
                $scope.$apply();
            }
        );
    };
});

KangoAPI.onReady(function() {
    angular.bootstrap(document.body, ['popup']);
});