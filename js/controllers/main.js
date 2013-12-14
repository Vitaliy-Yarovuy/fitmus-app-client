'use strict';

/* Controllers */

function MainCtrl($scope, connect, navigation, $rootScope, $sce) {
    var now = new Date(),
        block = false,
        insert_index = 0,
        is_replace = false;

    $scope.edit_mode = false;

    navigation.beforePageChange("main_page",function(id_add_exercise){
        connect.getTrain(function(err,data){
            if(err){
                alert(err.message);
                return ;
            }

            $rootScope.trains = data;
            selectExercise($rootScope.select_timestamp);
            if(id_add_exercise){
                addExercise(id_add_exercise);
            }else{
                setBlock();
            }
            $scope.$apply();
        });
    });

    $rootScope.$watch('select_timestamp', selectExercise);
    $rootScope.$watch('select_date', function(newDate){
        //console.log('select_date',newDate);
        var aDate = newDate.split("-");
        $rootScope.select_timestamp = getMoscovTimeStamp(aDate[0],aDate[1]-1,aDate[2]-1)
        console.log("$rootScope.select_timestamp",$rootScope.select_timestamp);
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
        $rootScope.select_date = XDate($rootScope.select_date).addDays(1).toString("yyyy-MM-dd");
    };
    $rootScope.prevDay = function(){
        $rootScope.select_date = XDate($rootScope.select_date).addDays(-1).toString("yyyy-MM-dd");
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
        $.mobile.changePage("#select_muscle_page",{transition:"slideup"});
    };
    $scope.replace = function(train){
        insert_index  = $scope.select_trains.indexOf(train)+1;
        is_replace  = true;
        $.mobile.changePage("#select_muscle_page",{transition:"slideup"});
    };
    $scope.select = function(train){
        $rootScope.select_train = train;
        $.mobile.changePage("#exercise_page",{transition:"slideup"});
    };

    function setBlock(){
        block = true;
        setTimeout(function(){ block = false; },200);
    }

    function normalisePosition(trains){
        trains.forEach(function(train,index){
            train.position = index + 1;
        });
    }

    function addExercise(id_exercise){
        var timestamp = $rootScope.select_timestamp,
            train = {
                comment: "",
                date: $rootScope.select_date+" 12:00:00",
                date_unix: timestamp,
                id_exercise: id_exercise,
                id_muscle_group: $scope.exercises[id_exercise].id_muscle_group,
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