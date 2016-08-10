angular.module('klavotools', ['klavotools.joke'])
.directive('negate', [function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attribute, ngModelController) {
            ngModelController.$isEmpty = function(value) {
                return !!value;
            };

            ngModelController.$formatters.unshift(function (value) {
                return !value;
            });

            ngModelController.$parsers.unshift(function (value) {
                return !value;
            });
        }
    };
}])
.controller('KTSVersion', function($scope) {
    kango.invokeAsync('KlavoTools.version', function(ver) {
        $scope.version = ver;
        $scope.$apply();
    });
})
.controller('GlobalSettings', function($scope) {
    $scope.settings = [];
    kango.invokeAsync('KlavoTools.Settings.get', function(data) {
        var settings = [];
        for (var key in data) {
            settings.push({
                name: key,
                type: typeof data[key],
                value: data[key],
            });
        }
        $scope.settings = settings;
    });
    $scope.$watch('settings', function(newSettings, oldSettings) {
        if (!newSettings.length || !oldSettings.length) {
            return false;
        }
        var settings = {};
        newSettings.forEach(function (setting) {
            settings[setting.name] = setting.value;
        });
        kango.invokeAsync('KlavoTools.Settings.set', settings);
    }, true);
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
    kango.invokeAsync('KlavoTools.UserJS.getAllScripts', function(scripts) {
        $scope.scripts = scripts;
    });

    $scope.toggle = function (name, event) {
        if (event.target.id === name) {
            return false;
        }
        $scope.scripts[name].disabled = !$scope.scripts[name].disabled;
        $scope.onChange(name);
    };

    $scope.onChange = function (name) {
        var scripts = $scope.scripts;
        if (scripts[name].disabled) {
            return $scope.save(name);
        }

        var disabled = [];
        scripts[name].conflicts.forEach(function (conflictName) {
            if (scripts[conflictName] && !scripts[conflictName].disabled) {
                disabled.push(conflictName);
                scripts[conflictName].disabled = true;
                $scope.save(conflictName);
            }
        });

        if (disabled.length > 0) {
            alert('Следующие скрипты были отключены, т.к. они конфликтуют ' +
                    'с ' + name + ":\n\n" + disabled.join(', '));
        }

        $scope.save(name);
    };

    $scope.save = function (name) {
        kango.invokeAsync('KlavoTools.UserJS.updateScriptData', name, {
            disabled: $scope.scripts[name].disabled,
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
.filter('settingDescription', function () {
    return function (input) {
        switch (input) {
            case 'useWebSockets': return 'Использовать WebSocket соединение с сайтом.';
        }
    }
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
