'use strict';

/* Controllers */

function ExerciseCtrl($scope, connect, navigation, $rootScope, $sce, $timeout, message) {

    /**
     * before enter to page trigger
     */
    navigation.beforePageChange("exercise_page",function(){
        if($rootScope.select_train && !$rootScope.select_train.result){
            addEmptyResult();
        }
        $rootScope.comment = $sce.trustAsHtml($rootScope.select_train && $rootScope.select_train.comment || "");
        updateList();
        $timeout(function(){
            $rootScope.$apply();
        },200);
    });

    navigation.beforePageLeave("exercise_page",function(){
        $rootScope.$broadcast("stopTimer",null);
    });

    /**
     * remove approach from results
     * @param index
     */
    $scope.remove = function(index){
        message.confirm("Удалить "+index+" подход ?", function(answer){
            if(answer == 1){
                delete $rootScope.select_train.result[index];
                while($rootScope.select_train.result[index+1]){
                    $rootScope.select_train.result[index] = $rootScope.select_train.result[index+1];
                    index += 1;
                }
                delete $rootScope.select_train.result[index];
                updateList();
            }
        });
    };

    /**
     * flag to show remove button ( last approach cannot be deleted )
     * @param index
     * @returns {boolean}
     */
    $scope.isShowRemoveBtn = function(index){
        var key = Object.keys($rootScope.select_train.result).length;
        return parseInt(index) != key;
    };

    /**
     * auto add empty approach at end results
     * @type {*|function()}
     */
    var unWatch = $rootScope.$watch("select_train",function(newTrain){
        if(newTrain){
            $rootScope.$watch("select_train.result",function(newResult){
                if(newResult){
                    var key = Object.keys(newResult).length,
                        obj = newResult[key];
                    if(key == 0 || obj['c'] || obj['w'] || obj['d'] || obj['t'] || obj['tr'] || obj['tw']){
                        addEmptyResult();
                        updateList();
                    }
                }
            },true);
            unWatch();
        }
    });

    /**
     * update list need for jquery mobile
     * @type {Function}
     */
    var updateList = _.debounce(function(){
        $('#exercise_page [data-role="listview" ]').listview().listview("refresh");
    },10);

    /**
     * add empty approach
     */
    function addEmptyResult(){
        if(!$rootScope.select_train.result){
            $rootScope.select_train.result = {};
        }
        var key = Object.keys($rootScope.select_train.result).length + 1;
        var type = $rootScope.exercises[$rootScope.select_train.id_exercise].type;
        $rootScope.select_train.result[key] = {};
        type.split("").forEach(function(k){
            $rootScope.select_train.result[key][k] = 0;
        });
    }

}
