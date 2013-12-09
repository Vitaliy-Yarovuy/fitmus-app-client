'use strict';

/* Controllers */

function SettingsCtrl($scope, connect, navigation, $rootScope) {

    $rootScope.settings = {
        is_show_time: true,
        is_auto_update: true,
        weight_unit: 1,
        distance_unit: 1
    };


    navigation.beforePageChange("settings_page",function(){

        connect.getData(function(err,data){
            if(err){
                alert(err.message);
                return ;
            }
            $scope.units = data.units;
            $scope.$apply();

        });
    });



}
