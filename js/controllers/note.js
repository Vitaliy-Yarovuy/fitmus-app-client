'use strict';

/* Controllers */

function NoteCtrl($scope, connect, navigation, $rootScope, $sce, timeconverter, message) {
    var block,
        isLoadData = false;
    $scope.select_note = {};

    /**
     * before enter to page trigger
     */
    navigation.beforePageChange("note_page",function(){
        if(!isLoadData){
            connect.getNote(function(err,data){
                if(err){
                    message.alert(err.message);
                    return ;
                }
                isLoadData = true;
                setBlock();
                $scope.nodes = data;
                //console.log("note_page data update",data,$rootScope.select_date);
                selectTimestamp($rootScope.select_date);
                $scope.$apply();
            });
        }
    });

    /**
     * trigger for synchronize event
     */
    $rootScope.$on('sync', function(){
        isLoadData = false;
    });


    $rootScope.$watch('select_date',selectTimestamp);

    /**
     * handler on select timestamp
     * @param newDate
     */
    function selectTimestamp(newDate){
        if($scope.nodes){
            var newTimestamp = timeconverter.convertDayToTimestamp(newDate) - 12 * 60 * 60;
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

    /**
     * stop listen change note for small time (need for update data)
     */
    function setBlock(){
        block = true;
        setTimeout(function(){ block = false; },200);
    }

    /**
     * listen change note for mark  note as changed (and need save to server)
     */
    $scope.$watch('select_note.note',function(){
        if(!block){
            $scope.select_note.$$_status = "updated";
        }
    });
}
