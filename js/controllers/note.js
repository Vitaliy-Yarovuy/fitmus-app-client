'use strict';

/* Controllers */

function NoteCtrl($scope, connect, navigation, $rootScope, $sce, timeconverter) {
    var block,
        isLoadData = false;
    $scope.select_note = {};

    navigation.beforePageChange("note_page",function(){
        if(!isLoadData){
            connect.getNote(function(err,data){
                if(err){
                    alert(err.message);
                    return ;
                }
                isLoadData = true;
                setBlock();
                $scope.nodes = data;
                console.log("note_page data update",data,$rootScope.select_date);
                alert(JSON.stringify(data));
                alert($rootScope.select_date);
                selectTimestamp($rootScope.select_date);
                $scope.$apply();
            });
        }
    });

    $rootScope.$on('sync', function(){
        isLoadData = false;
    });

    $rootScope.$watch('select_date',selectTimestamp);

    function selectTimestamp(newDate){
        if($scope.nodes){
            var newTimestamp = timeconverter.convertDayToTimestamp(newDate);
            if(!$scope.nodes[newTimestamp]){
                $scope.nodes[newTimestamp] = {
                    date: $rootScope.select_date,
                    date_unix: newTimestamp,
                    note: ""
                }
            }
            setBlock();
            $scope.select_note = $scope.nodes[newTimestamp];
        }
    }

    function setBlock(){
        block = true;
        setTimeout(function(){ block = false; },200);
    }

    $scope.$watch('select_note.note',function(){
        if(!block){
            $scope.select_note.$$_status = "updated";
        }
    });
}
