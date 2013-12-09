app.directive('ngApproach', function($compile, $rootScope, $timeout) {

   var unit_names = {
      c: "count",
      d: "distance",
      l: "length",
      t: "time",
      w: "weight"
   };

    function getData(scope,path){
        var pathEls = path.split("."),
            element = scope;
        while(pathEls.length && element){
            element = element[pathEls.shift()];
        }
        return element;
    }

    function setData(scope,path,value){
        var key,
            pathEls = path.split("."),
            element = scope;
        while(pathEls.length > 1 && element){
            element = element[pathEls.shift()];
        }
        while(pathEls.length > 1 ){
            key = pathEls.shift();
            element[key] = {};
            element = element[key];
        }
        element[pathEls.shift()] = value;
        scope.$apply();
    }

    function toTime(time){
        return sprintf("%02d:%02d",Math.floor(time/60),time % 60);
    }

    return {
        scope: 'false',
        link: function(scope, $element, attrs) {
            var data = getData(scope, attrs.ngApproach),
                exercise = $rootScope.exercises[$rootScope.select_train.id_exercise],
                types = exercise.type.split(""),
                units = [1,1],
                $results = [$element.find("[ng-approach-result-1]"), $element.find("[ng-approach-result-2]")],
                $iTimers = [$element.find("[ng-approach-rest]"), $element.find("[ng-approach-work]")];

            if(types[0] == "w"){
                units[0] = $rootScope.settings.weight_unit;
            }

            if(types[0] == "d"){
                units[0] = $rootScope.settings.distance_unit;
            }

            $rootScope.$watch("settings.is_show_time",function(is_show_time){
                $element[is_show_time?"removeClass":"addClass"]("no-time");
            });

            $results.forEach(function($result, index){
                var type = types[index],
                    key = attrs.ngApproach + "." + type,
                    value = getData(scope, key),
                    unit = $rootScope.units[unit_names[type]],
                    coeff = unit[units[index]].coeff,
                    $btn = $result.next(),
                    unit_ids = Object.keys(unit);

                $result.val(Math.floor(value*coeff*100)/100);
                $result.on("change",function(){
                    var value = $result.val();
                    coeff = unit[units[index]].coeff;
                    setData(scope, key, value / coeff );
                });
                scope.$watch(key,function(newValue){
                    coeff = unit[units[index]].coeff;
                    $result.val(Math.floor(newValue*coeff*100)/100);
                });

                $btn.css("background",unit[units[index]].color);
                $btn.html(unit[units[index]].sym);
                $btn.on("click",function(){
                    var id = units[index].toString(),
                        unit_index = unit_ids.indexOf(id) + 1;
                    units[index] = unit_ids[unit_index%unit_ids.length];
                    coeff = unit[units[index]].coeff;
                    value = getData(scope, key);
                    $result.val(Math.floor(value*coeff*100)/100);
                    $btn.css("background",unit[units[index]].color);
                    $btn.html(unit[units[index]].sym);
                });

            });

            $iTimers.forEach(function($iTimer, index){
                var type = index?"w":"r",
                    $btn = $iTimer.next(),
                    key = attrs.ngApproach + ".t" + type,
                    value = getData(scope, key)|| 0,
                    timeId,
                    stopTimer = function(){
                        $timeout.cancel(timeId);
                        timeId = null;
                    },
                    tickTimer = function(){
                        timeId = $timeout(function(){
                            value = getData(scope, key)||0;
                            if(value < 59 * 60 + 59 ){
                                setData(scope, key, value + 1);
                                tickTimer();
                            }else{
                                stopTimer();
                            }
                        },1000);
                    };

                $iTimer.val(toTime(value));
                scope.$watch(key,function(newValue){
                    $iTimer.val(toTime(newValue||0));
                });
                $btn.on("click",function(){
                    value = getData(scope, key)||0;
                    if(timeId){
                        stopTimer();
                    }
                    if(value == 0){
                        $rootScope.$broadcast("stopTimer",key);
                        tickTimer();
                    }
                });
                $iTimer.on("click",function(){
                    value = getData(scope, key)||0;
                    if(timeId){
                        stopTimer();
                    }
                });

                $rootScope.$on("stopTimer",function(tKey){
                    if(tKey!= key){
                        stopTimer();
                    }
                });
            });
        }
    };
});