angular.module('popup.fl-editor', [])
.controller("EditorCtrl", function($scope, $rootScope) {
    $scope.txtlinks = '';
    $scope.title = '';
    $scope.url = '';
    
    $scope.$on('open-editor', function() {
        $scope.visible = true;
    });
    
    $scope.add = function() {
        $scope.txtlinks +=
            '[link]' + 
                '[title]' + $scope.title + '[/title]' +
                '[url]' + $scope.url + '[/url]' +
            '[/link]\r\n';
        
        $scope.title = '';
        $scope.url = '';
    };
    
    $scope.save = function() {
        var json = [];
        var arr = $scope.txtlinks.split('[link]');
        
        for(i=1; i<arr.length; i++) {
            json.push({
                title: getValueByTag(arr[i], 'title'),
                url: getValueByTag(arr[i], 'url')
            });
        }
        
        kango.storage.setItem('fast-links', json);
        
        $scope.visible = false;
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
        
        $scope.txtlinks = txt;
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