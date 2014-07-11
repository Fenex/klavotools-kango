angular.module('klavotools', ['klavotools.joke'])
.controller('KTSVersion', function($scope) {
    kango.invokeAsync('KlavoTools.version', function(ver) {
        $scope.version = ver;
        $scope.$apply();
    });
})
.controller('StyleCtrl', function($scope) {
    kango.invokeAsync('KlavoTools.Skin.getAll', function(res) {
        $scope.skins = res;
        for(var name in res) {
            if(res[name])
                $scope.active = name;
        }
    });
    
    $scope.$watch('active', function(a, b) {
        for(var name in $scope.skins) {
            $scope.skins[name] = (a == name) ? true : false;
        }
        kango.invokeAsync('KlavoTools.Skin.setActive', a);
    });
})
.controller('ScriptCtrl', function($scope) {
    kango.invokeAsync('KlavoTools.Script.get', function(res) {
        $scope.scripts = res;
    });
    
    $scope.save = function(script) {
        var data = {};
        data[script] = $scope.scripts[script].enable;
        kango.invokeAsync('KlavoTools.Script.set', data);
    };
})
.filter('skin', function() {
    return function(input) {
        switch(input) {
            case 'beige': return 'Бежевый';
            case 'green': return 'Зелёный';
            case 'pink': return 'Розовый';
            case 'blue': return 'Синий';
            case 'gray': return 'Серый';
            default: return input;
        }
    }
});

KangoAPI.onReady(function() {
    angular.bootstrap(document.body, ['klavotools']);
});