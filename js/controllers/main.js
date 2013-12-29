'use strict';

/* Controllers */

function MainCtrl($scope, connect, navigation, timeconverter, $rootScope, $sce) {
    var now = new Date(),
        isLoadData = false,
        block = false,
        insert_index = 0,
        is_replace = false,
        timestamps = [];

    /**
     * is edit mode( can move/replace/delete/add exercise)
     * @type {boolean}
     */
    $scope.edit_mode = false;

    /**
     * before enter to page trigger
     */
    navigation.beforePageChange("main_page",function(id_add_exercise, id_muscle_group){
        var run = function(){
            if(id_add_exercise){
                addExercise(id_add_exercise, id_muscle_group);
            }else{
                setBlock();
            }
            $scope.$apply();
        };
        if(isLoadData){
            run();
        }else{
            connect.getTrain(function(err,data){
                if(err){
                    alert(err.message);
                    return ;
                }
                isLoadData = true;
                $rootScope.trains = data;
                selectExercise($rootScope.select_timestamp);
                run();
            });
        }
    });

    /**
     * trigger for synchronize event
     */
    $rootScope.$on('sync', function(){
        isLoadData = false;
    });

    /**
     * update timestamps
     */
    $rootScope.$watch('trains',_.debounce(function(trains){
        if(trains){
            timestamps = Object.keys(trains).sort();
        }
    },800),true);
    /**
     * watch date change
     */
    $rootScope.$watch('select_timestamp', selectExercise);
    $rootScope.$watch('select_date', function(newDate){
        $rootScope.select_timestamp = timeconverter.convertDayToTimestamp(newDate);
        //console.log("$rootScope.select_timestamp",$rootScope.select_timestamp);
    });

    /**
     * check trains status is it change and need save to server
     */
    $rootScope.$watch('trains', _.debounce(function(newTrains, oldTrains){
        if(!block && oldTrains){
            var diff = _.diff(oldTrains,newTrains);
            _.forEach(diff,function(item, key){
                this[key].$$_status = "updated";
            },$rootScope.trains);
        }
    },50),true);

    //timestamp on Moscov time +4h
    $rootScope.select_date = XDate(now).toString("yyyy-MM-dd");
    /**
     * select next day
     */
    $rootScope.nextDay = function(){
        $rootScope.select_date = addToDate($rootScope.select_date,1);
    };
    /**
     * select prev day
     */
    $rootScope.prevDay = function(){
        $rootScope.select_date = addToDate($rootScope.select_date,-1);
    };
    /**
     * toggle edit state
     */
    $scope.toggleState = function(){
        $scope.edit_mode = !$scope.edit_mode;
        console.log('$scope.edit_mode',$scope.edit_mode);
    };
    /**
     * move exercise up in list
     * @param train
     */
    $scope.positionUp = function(train){
        var upperTrain,index = $scope.select_trains.indexOf(train),
            position = train.position;
        if(index > 0){
            upperTrain = $scope.select_trains[index-1];
            train.position = upperTrain.position;
            upperTrain.position = position;
            selectExercise($rootScope.select_timestamp);
        }
    };
    /**
     * move exercise down in list
     * @param train
     */
    $scope.positionDown = function(train){
        var downerTrain,index = $scope.select_trains.indexOf(train),
            position = train.position;
        if(index < $scope.select_trains.length - 1){
            downerTrain = $scope.select_trains[index + 1];
            train.position = downerTrain.position;
            downerTrain.position = position;
            selectExercise($rootScope.select_timestamp);
        }
    };
    /**
     * remove exercise
     * @param train
     */
    $scope.remove = function(train){
        train.status = "Deleted";
        selectExercise($rootScope.select_timestamp);
    };
    /**
     * add exercise after
     * @param train
     */
    $scope.addAfter = function(train){
        insert_index  = $scope.select_trains.indexOf(train)+1;
        is_replace  = false;
        $.mobile.changePage("#select_muscle_page",{transition:"none"});
    };
    /**
     * replace exercise
     * @param train
     */
    $scope.replace = function(train){
        insert_index  = $scope.select_trains.indexOf(train)+1;
        is_replace  = true;
        $.mobile.changePage("#select_muscle_page",{transition:"none"});
    };
    /**
     * select exercise and go to exercise page
     * @param train
     */
    $scope.select = function(train){
        $rootScope.select_train = train;
        $rootScope.select_train_old = findOldTrain(train);
        $.mobile.changePage("#exercise_page",{transition:"none"});
    };

    /**
     * get already exist train for avoid duplication
     * @param selectTrain
     * @returns {*}
     */
    function findOldTrain(selectTrain){
        var timestamp = $rootScope.select_timestamp,
            availableTimestamp = timestamps.filter(function(time){
                return time < timestamp;
            }).reverse(),
            oldTrain = null;
        _.find(availableTimestamp,function(time){
            var trains = $rootScope.trains[time],
                train = _.find(trains,function(train){
                    return train.status != "Deleted" && train.id_exercise == selectTrain.id_exercise;
                });
            oldTrain = train;
            return !!train;
        });
        return oldTrain;
    }

    /**
     * stop listen change train for small time (need for update data)
     */
    function setBlock(){
        block = true;
        setTimeout(function(){ block = false; },200);
    }


    /**
     * add days to date
     * @param dayStr
     * @param dayNum
     * @returns {*|String|string}
     */
    function addToDate(dayStr,dayNum){
        return XDate(dayStr).addDays(dayNum).toString("yyyy-MM-dd");
    }

    /**
     * normalise train numbers in list
     * @param trains
     */
    function normalisePosition(trains){
        trains.forEach(function(train,index){
            train.position = index + 1;
        });
    }

    /**
     * add train by exercise and group
     * @param id_exercise
     * @param id_muscle_group
     */
    function addExercise(id_exercise, id_muscle_group){
        var timestamp = $rootScope.select_timestamp,train;

        train = $rootScope.trains[timestamp] &&  $rootScope.trains[timestamp].filter(function(tr){
            return tr.id_exercise == id_exercise && tr.id_exercise == id_muscle_group;
        })[0];

        if(train){
            if(train.status == "Active"){

            }else{
                train.status = "Active";
                if(is_replace){
                    $scope.select_trains[insert_index-1].status = "Deleted";
                    $scope.select_trains.splice(insert_index-1,1,train);
                }else{
                    $scope.select_trains.splice(insert_index,0,train);
                }
            }
        }else{
            train = {
                comment: "",
                date: $rootScope.select_date+" 12:00:00",
                date_unix: timestamp,
                id_exercise: id_exercise,
                id_muscle_group: id_muscle_group,
                mode: "Normal",
                position: "",
                result: null,
                status: "Active"
            };
            if(is_replace){
                $scope.select_trains[insert_index-1].status = "Deleted";
                $scope.select_trains.splice(insert_index-1,1,train);
            }else{
                $scope.select_trains.splice(insert_index,0,train);
            }
            if(!$rootScope.trains[timestamp]){
                $rootScope.trains[timestamp] = [train];
            }else{
                $rootScope.trains[timestamp].push(train);
            }
        }
        normalisePosition($scope.select_trains);
        updateList();
    }

    /**
     * update list need for jquery mobile
     * @type {Function}
     */
    var updateList = _.debounce(function(){
        $('#main_page [data-role="listview" ]').listview().listview("refresh");
    },10);

    /**
     * handler for select timestamp
     * @param timestamp
     * @param oldTimestamp
     */
    function selectExercise(timestamp, oldTimestamp) {
        var trains;
        if($rootScope.trains){
            trains  = $rootScope.trains[timestamp] || [];
            trains = trains.filter(function(train){
                return train.status != "Deleted";
            });
            trains.sort(function(a,b){
                return parseInt( a.position || "0") > parseInt( b.position || "0");
            });
            normalisePosition(trains);
            console.log(trains);
            $scope.select_trains = trains;
            $rootScope.comment = $sce.trustAsHtml(trains.reduce(function(total, train){
                if(train.comment){
                    return total + train.comment + "<br/><br/>";
                } else {
                    return total;
                }
            },""));
        }
        updateList();
    }


}
