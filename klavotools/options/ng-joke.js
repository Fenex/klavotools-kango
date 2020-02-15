angular.module('klavotools.joke', [])
.directive('uiRisovalka', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'uiRisovalka_Template',
        link: function (scope, element, attrs) {
        },
        controller: function($scope, $http, $timeout) {
            var COUNT = 3;
            $scope.imgs = [];
            $scope.loaded = false;
            return;
            function getImgStruct(data) {
                var e = data;
                e.author = e.author ? 'Автор: ' + e.author : '';
                var l_id = e.id.toLocaleLowerCase();
                e.url = 'http://risovalka.zzzae.biz/g/'+l_id[0]+'/'+l_id[1]+'/'+l_id[2]+'/'+e.id+'_th.png';
                return e;
            }

            $timeout(function() {
                $http.get('http://r.zzzae.biz/kts.php?KTS_REQUEST&l='+COUNT).then(function(res) {
                    if (typeof res != 'object' || !Array.isArray(res.data)) {
                        return;
                    }

                    for(var i=0; i<res.data.length; i++) {
                        $scope.imgs.push(getImgStruct(res.data[i]));
                    }
                    $scope.loaded = true;
                });
            }, 500);
        }
    };
})
.directive('uiBug', function() {
    return {
        restrict: 'E',
        replace: true,
        template: '<img src="https://klavogonki.ru/img/bug.png" />',
        link: function(scope, element, attrs) {
            var timer = null;
            var rotating = false;
            var battle = {
                elem: element[0],
                x: -100,
                y: 280,
                step: 0,
                finish: 205,
                values: [],
                rotate: null,
                first: true,

                push_values: function() {
                    this.values.push({r:null, x:  null, y:  null}); // not used
                    this.values.push({r:0,    x:  1,    y:  0   });
                    this.values.push({r:45,   x:  1,    y:  1   });
                    this.values.push({r:90,   x:  0,    y:  1   });
                    this.values.push({r:135,  x: -1,    y:  1   });
                    this.values.push({r:180,  x: -1,    y:  0   });
                    this.values.push({r:225,  x: -1,    y: -1   });
                    this.values.push({r:270,  x:  0,    y: -1   });
                    this.values.push({r:315,  x:  1,    y: -1   });
                },

                randomRotate: function(a) {
                    var random = a || Math.round(Math.random()*(this.values.length-2)+1);
                    rotating = true;
                    setTimeout(active, 1500);
                    this.rotate = this.values[random];
                    this.elem.setAttribute('style', 'position:absolute;transform: rotate('+(this.rotate.r+45)+'deg);transition: transform 1300ms;');
                    this.setPos();
                },

                onclick: function() {
                    if(!this.first && (timer || rotating))
                        return;
                    timer = setInterval(run, 50);
                },

                init: function() {
                    this.push_values();

                    //create battle

                    this.elem.addEventListener('click', this.onclick);

                    //set rotate
                    this.randomRotate(8);
                    this.setPos();

                    //run
                    this.onclick();
                },

                setPos: function() {
                    this.elem.style.top = this.y.toString() + 'px';
                    this.elem.style.left = this.x.toString() + 'px';
                },

                newPosition: function() {
                    this.x += this.rotate.x;
                    this.y += this.rotate.y;
                    this.step++;
                    if(this.step > this.finish) {
                        stop();
                        this.step = 0;
                        if(this.first) {
                            this.first = false;
                            this.randomRotate(2);
                            this.finish = 40;
                            return;
                        }

                        this.randomRotate();
                        return;
                    }
                    this.setPos();
                }
            };

            battle.init();

            function run() {
                battle.newPosition();
            }

            function stop() {
                clearInterval(timer);
                timer = null;
            }

            function active() {
                rotating = false;
            }

        }
    }
});
