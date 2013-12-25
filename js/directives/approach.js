app.directive('ngApproach', function ($compile, $rootScope, $timeout) {

    var unit_names = {
        c: "count",
        d: "distance",
        l: "length",
        t: "time",
        w: "weight"
    };

    $rootScope.defaultUnits = {
        c: 1,
        d: 1,
        l: 1,
        t: 1,
        w: 1
    };
    $rootScope.$watch("settings",function(settings){
        if(settings){
            $rootScope.defaultUnits.w = settings.weight_unit;
            $rootScope.defaultUnits.d = settings.distance_unit;
        }
    },true);

    function setData(scope, path, value, isSilent) {
        console.log("setData",path, value, isSilent);
        var key,
            pathEls = path.split("."),
            element = scope;
        while (pathEls.length > 1 && element) {
            element = element[pathEls.shift()];
        }
        while (pathEls.length > 1) {
            key = pathEls.shift();
            element[key] = {};
            element = element[key];
        }
        element[pathEls.shift()] = value;
        isSilent || scope.$apply();
    }

    function toTime(time) {
        return sprintf("%02d:%02d", Math.floor(time / 60), time % 60);
    }

    return {
        scope: 'false',
        link: function (scope, $element, attrs) {
            var data = scope.$eval(attrs.ngApproach),
                oldApproach = scope.$eval(attrs.ngApproachOld),
                exercise = $rootScope.exercises[$rootScope.select_train.id_exercise],
                types = exercise.type.split(""),
                //units = [1, 1],
                $resultsOld = [$element.find("[ng-approach-old-result-1]"), $element.find("[ng-approach-old-result-2]")],
                $results = [$element.find("[ng-approach-result-1]"), $element.find("[ng-approach-result-2]")],
                $iTimersOld = [$element.find("[ng-approach-old-rest]"), $element.find("[ng-approach-old-work]")],
                $iTimers = [$element.find("[ng-approach-rest]"), $element.find("[ng-approach-work]")];

            $element[($rootScope.settings && $rootScope.settings.is_show_time) ? "removeClass" : "addClass"]("no-time");
            $rootScope.$watch("settings.is_show_time", function (is_show_time) {
                $element[is_show_time ? "removeClass" : "addClass"]("no-time");
            });

            $results.forEach(function ($result, index) {
                var type = types[index],
                    key = attrs.ngApproach + "." + type,
                    value = scope.$eval(key),
                    unit = $rootScope.units[unit_names[type]],
                    id_unit = $rootScope.defaultUnits[type],
                    coeff = unit[id_unit].coeff,
                    $btn = $result.next(),
                    unit_ids = Object.keys(unit);

                $result.val(Math.floor(value * coeff * 100) / 100);
                $result.on("change", function () {
                    var value = $result.val();
                    id_unit = $rootScope.defaultUnits[type];
                    coeff = unit[id_unit].coeff;
                    setData(scope, key, value / coeff);
                });
                scope.$watch(key, function (newValue) {
                    id_unit = $rootScope.defaultUnits[type];
                    coeff = unit[id_unit].coeff;
                    $result.val(Math.floor(newValue * coeff * 100) / 100);
                });
                $btn.css("background", unit[id_unit].color);
                $btn.html(unit[id_unit].sym);
                $btn.on("click", function () {
                    id_unit = $rootScope.defaultUnits[type].toString();
                    var unit_index = unit_ids.indexOf(id_unit) + 1;
                    id_unit = unit_ids[unit_index % unit_ids.length];
                    $rootScope.defaultUnits[type] = id_unit;
                    $rootScope.$apply();
                });
                $rootScope.$watch("defaultUnits."+type, function(id){
                    id_unit = id;
                    coeff = unit[id_unit].coeff;
                    value = scope.$eval(key);
                    $result.val(Math.floor(value * coeff * 100) / 100);
                    $btn.css("background", unit[id_unit].color);
                    $btn.html(unit[id_unit].sym);
                });
            });

            $iTimers.forEach(function ($iTimer, index) {
                var type = index ? "w" : "r",
                    $btn = $iTimer.next(),
                    key = attrs.ngApproach + ".t" + type,
                    value = scope.$eval(key) || 0,
                    timeId,
                    stopTimer = function () {
                        $timeout.cancel(timeId);
                        timeId = null;
                    },
                    tickTimer = function () {
                        timeId = $timeout(function () {
                            value = scope.$eval(key) || 0;
                            if (value < (59 * 60 + 59)) {
                                setData(scope, key, value + 1);
                                console.log("timer tick",value);
                                tickTimer();
                            } else {
                                stopTimer();
                            }
                        }, 1000);
                    };

                $iTimer.on("change.time",function(){
                    var aTime = $iTimer.val().split(":");
                    value = parseInt(aTime[0]) * 60 + parseInt(aTime[1]);
                    setData(scope, key, value, true);
                    $rootScope.$broadcast("stopTimer", "all");
                });
                $iTimer.val(toTime(value));
                scope.$watch(key, function (newValue) {
                    $iTimer.val(toTime(newValue || 0)).change();
                });
                $btn.on("click", function () {
                    value = scope.$eval(key) || 0;
                    if (timeId) {
                        stopTimer();
                    }
                    if (value == 0) {
                        $rootScope.$broadcast("stopTimer", key);
                        tickTimer();
                    }
                });
                $iTimer.on("click", function () {
                    value = scope.$eval(key) || 0;
                    if (timeId) {
                        stopTimer();
                    }
                });

                $rootScope.$on("stopTimer", function (tKey) {
                    if (tKey != key) {
                        stopTimer();
                    }
                });
            });

            $iTimersOld.forEach(function ($iTimer, index) {
                var type = index ? "w" : "r",
                    key = attrs.ngApproachOld + ".t" + type,
                    value = scope.$eval(key) || 0;
                $iTimer.html(toTime(value));
                scope.$watch(key, function (newValue) {
                    $iTimer.html(toTime(newValue || 0));
                });
            });


            $resultsOld.forEach(function ($result, index) {
                var type = types[index],
                    key = attrs.ngApproachOld + "." + type,
                    value = scope.$eval(key) || 0,
                    id_unit = $rootScope.defaultUnits[type],
                    unit = $rootScope.units[unit_names[type]],
                    coeff = unit[id_unit].coeff,
                    unit_ids = Object.keys(unit);

                $result.html(Math.floor(value * coeff * 100) / 100);
                scope.$watch(key, function (newValue) {
                    newValue = newValue || 0;
                    id_unit = $rootScope.defaultUnits[type];
                    coeff = unit[id_unit].coeff;
                    $result.html(Math.floor(newValue * coeff * 100) / 100);
                });
                $rootScope.$watch("defaultUnits."+type, function(id){
                    id_unit = id;
                    coeff = unit[id_unit].coeff;
                    value = scope.$eval(key);
                    $result.html(Math.floor(value * coeff * 100) / 100);
                });
            });

        }
    };
});