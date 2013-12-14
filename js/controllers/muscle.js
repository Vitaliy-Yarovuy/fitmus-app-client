'use strict';

/* Controllers */

function MuscleCtrl($scope, connect, navigation, $rootScope) {

    navigation.beforePageChange("select_muscle_page",function(){
        $('#select_muscle_page [data-role="listview" ]').listview().listview("refresh");
    });
}
