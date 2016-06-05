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
        
        kango.invokeAsync('KlavoTools.Skin.save', a);
    });
})
.controller('ScriptCtrl', function($scope) {
    kango.invokeAsync('KlavoTools.UserJS.getAll', function(scripts) {
        var tmp = {};
        for(var i=0; i<scripts.length; i++) {
            var name = scripts[i].name.match(/^(.+)\.user\.js/)[1];
            tmp[name] = {
                enabled: scripts[i].enabled,
                description: scripts[i].desc
            }
        }
        
        $scope.scripts = tmp;
    });
    
    $scope.save = function(script) {
        kango.invokeAsync('KlavoTools.UserJS.set', {
            id: script+'.user.js',
            enabled: $scope.scripts[script].enabled
        });
    };
})
.controller('CompetitionCtrl', function($scope) {
    $scope.delay = null;
    $scope.displayTime = null;

    $scope.rates = {
        x1: false,
        x2: false,
        x3: false,
        x5: false
    };

    kango.invokeAsync('KlavoTools.Competitions.getParams', function(res) {
        $scope.delay = res.delay;
        $scope.displayTime = res.displayTime;
        for(var i=0; i<res.rates.length; i++) {
            if(typeof $scope.rates['x'+res.rates[i]] == 'boolean') {
                $scope.rates['x'+res.rates[i]] = true;
            }
        }
    });

    function sendPrefs(data) {
        kango.invokeAsync('KlavoTools.Competitions.setParams', data);
    };

    $scope.change = function() {
        var arr = [];
        for(var rate in $scope.rates) {
            if($scope.rates[rate])
                arr.push(parseInt(rate.match(/\d+/)[0]));
        }

        sendPrefs({rates: arr});
    }

    $scope.setDisplayTime = function () {
        sendPrefs({ displayTime: parseInt($scope.displayTime) });
    };

    $scope.$watch('delay', function(a, b) {
        if(typeof b != 'object')
            sendPrefs({delay: parseInt(a)});
    });
})
.filter('skin', function() {
    return function(input) {
        switch(input) {
            case 'beige': return 'Бежевый';
            case 'green': return 'Зелёный';
            case 'pink': return 'Розовый';
            case 'blue': return 'Синий';
            case 'gray': return 'Серый';
            case 'nikitakozin': return 'Минималистический стиль, убирающий лишний цветовой шум. Автор nikitakozin.';
            default: return input;
        }
    }
});

KangoAPI.onReady(function() {
    angular.bootstrap(document.body, ['klavotools']);
});
