angular.module('klavotools', ['klavotools.joke'])
.controller('KTSVersion', function($scope) {
    kango.invokeAsync('KlavoTools.version', function(ver) {
        $scope.version = ver;
        $scope.$apply();
    });
})

KangoAPI.onReady(function() {
    angular.bootstrap(document.body, ['klavotools']);
});