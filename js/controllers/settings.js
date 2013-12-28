    'use strict';

/* Controllers */

function SettingsCtrl($scope, connect, navigation, $rootScope) {
    var isLoadData = false;

    // move to connect
    //$rootScope.settings = {
    //    is_show_time: true,
    //    is_auto_update: true,
    //    weight_unit: 1,
    //    distance_unit: 1
    //};


    $rootScope.$watch("settings",function(newSetting){
        console.log("settings",newSetting);
    });


    $scope.logout = function(){
        connect.logout();
        $.mobile.changePage("#auth_page",{transition:"none"});
    };

    navigation.beforePageChange("settings_page",function(){
        if(!isLoadData){
            connect.getData(function(err,data){
                if(err){
                    alert(err.message);
                    return ;
                }
                isLoadData = true;
                $scope.units = data.units;
                $scope.$apply();
            });
        }
    });

}
