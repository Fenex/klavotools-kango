angular.module('popup.fl-editor', [])

.controller("popup:FastLinks", function($scope, $rootScope) {
    var ctrl = this;

    ctrl.txtlinks = '';
    ctrl.title = '';
    ctrl.url = '';
    ctrl.visible = false;

    $scope.$on('toggle-editor', function() {
        ctrl.visible = !ctrl.visible;
    });

    ctrl.add = function() {
        ctrl.txtlinks +=
            '[link]' +
                '[title]' + ctrl.title + '[/title]' +
                '[url]' + ctrl.url + '[/url]' +
            '[/link]\r\n';

        ctrl.url = ctrl.title = '';
    };

    ctrl.save = function() {
        var json = [];
        var arr = ctrl.txtlinks.split('[link]');

        for(i=1; i<arr.length; i++) {
            json.push({
                title: getValueByTag(arr[i], 'title'),
                url: getValueByTag(arr[i], 'url')
            });
        }

        kango.storage.setItem('fast-links', json);

        ctrl.visible = false;
        $scope.$emit('save-links');

        load();
    };

    function load() {
        var fl = kango.storage.getItem('fast-links') || [];
        var txt = '';
        for(var i=0; i<fl.length; i++) {
            txt +=
                '[link]' +
                    '[title]' + fl[i].title + '[/title]' +
                    '[url]' + fl[i].url + '[/url]' +
                '[/link]\r\n';
        }

        ctrl.txtlinks = txt;
    }

    load();
});

function getValueByTag(str, tag) {
    var p1 = str.indexOf('['+tag+']');
    var p2 = str.indexOf('[/'+tag+']');
    if((p1<0)||(p2<0))
        return false;
    return (str.substring(p1+2+tag.length, p2));
}
