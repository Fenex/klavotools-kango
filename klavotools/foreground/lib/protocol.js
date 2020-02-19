angular.module('klavotools.protocol', [])

.factory('Protocol', function ($q) {
    return {
        convert: function (url) {
            var defer = $q.defer()
            chrome.runtime.sendMessage(
                {
                    name: 'protocol/convert',
                    url: url
                },
                function (res) { defer.resolve(res.url) }
            )

            return defer.promise
        }
    }
})

.directive('kgPath', function (Protocol) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            Protocol.convert(attrs.href).then(function (url) {
                element.attr('href', url)
            })
        }
    }
})
