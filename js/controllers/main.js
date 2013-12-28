'use strict';

/* Controllers */

function MainCtrl($scope, connect, navigation, $rootScope, $sce) {
    var now = new Date(),
        isLoadData = false,
        block = false,
        insert_index = 0,
        is_replace = false,
        timestamps = [];

    $scope.edit_mode = false;

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

    $rootScope.$on('sync', function(){
        isLoadData = false;
    });

    $rootScope.$watch('trains',_.debounce(function(trains){
        if(trains){
            timestamps = Object.keys(trains).sort();
        }
    },800),true);
    $rootScope.$watch('select_timestamp', selectExercise);
    $rootScope.$watch('select_date', function(newDate){
        $rootScope.select_timestamp = convertDayToTimestamp(newDate);
        //console.log("$rootScope.select_timestamp",$rootScope.select_timestamp);
    });
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
    $rootScope.nextDay = function(){
        $rootScope.select_date = addToDate($rootScope.select_date,1);
    };
    $rootScope.prevDay = function(){
        $rootScope.select_date = addToDate($rootScope.select_date,-1);
    };
    $scope.toggleState = function(){
        $scope.edit_mode = !$scope.edit_mode;
        console.log('$scope.edit_mode',$scope.edit_mode);
    };

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
    $scope.remove = function(train){
        train.status = "Deleted";
        selectExercise($rootScope.select_timestamp);
    };
    $scope.addAfter = function(train){
        insert_index  = $scope.select_trains.indexOf(train)+1;
        is_replace  = false;
        $.mobile.changePage("#select_muscle_page",{transition:"none"});
    };
    $scope.replace = function(train){
        insert_index  = $scope.select_trains.indexOf(train)+1;
        is_replace  = true;
        $.mobile.changePage("#select_muscle_page",{transition:"none"});
    };
    $scope.select = function(train){
        $rootScope.select_train = train;
        $rootScope.select_train_old = findOldTrain(train);
        $.mobile.changePage("#exercise_page",{transition:"none"});
    };

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

    function setBlock(){
        block = true;
        setTimeout(function(){ block = false; },200);
    }

    function convertDayToTimestamp(date){
        var aDate = date.split("-");
        return getMoscovTimeStamp(aDate[0],aDate[1]-1,aDate[2]-1);
    }

    function addToDate(dayStr,dayNum){
        return XDate(dayStr).addDays(dayNum).toString("yyyy-MM-dd");
    }

    function normalisePosition(trains){
        trains.forEach(function(train,index){
            train.position = index + 1;
        });
    }

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

    var updateList = _.debounce(function(){
        $('#main_page [data-role="listview" ]').listview().listview("refresh");
    },10);

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

    function getMoscovTimeStamp(year,month,day){
        var date = new Date(year,month,day+1, 12 - 4 - (new Date()).getTimezoneOffset()/60, 0, 0 );
        return Math.floor(date.getTime()/1000);
    }

}
