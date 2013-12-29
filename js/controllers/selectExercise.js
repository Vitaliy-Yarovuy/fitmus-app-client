'use strict';

/* Controllers */

function SelectExerciseCtrl($scope, connect, navigation, $rootScope) {
    $scope.muscle_id = 0;

    /**
     * before enter to page trigger
     */
    navigation.beforePageChange("select_exercise_page",function(id){
        $scope.muscle_id = id;
        $scope.$apply();
        $('#select_exercise_page [data-role="listview" ]').listview().listview("refresh");
    });

}

