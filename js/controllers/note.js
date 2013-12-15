'use strict';

/* Controllers */

function NoteCtrl($scope, connect, navigation, $rootScope, $sce) {
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
                selectTimestamp($rootScope.select_date);
                $scope.$apply();
            });
        }
    });

    $rootScope.$watch('select_date',selectTimestamp);

    function selectTimestamp(newDate){
        if($scope.nodes){
            var date = new Date(newDate);
            var newTimestamp = date.getTime()/1000 + 2 * date.getTimezoneOffset()*60;
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
