'use strict';

/* Controllers */

function SettingsCtrl($scope, connect, navigation, $rootScope, message) {
    var isLoadData = false;

    // moved to connect
    //$rootScope.settings = {
    //    is_show_time: true,
    //    is_auto_update: true,
    //    weight_unit: 1,
    //    distance_unit: 1
    //};


    /**
     * logout trigger
     */
    $scope.logout = function(){
        connect.logout();
        $.mobile.changePage("#auth_page",{transition:"none"});
    };

    /**
     * before enter to page trigger
     */
    navigation.beforePageChange("settings_page",function(){
        if(!isLoadData){
            connect.getData(function(err,data){
                if(err){
                    message.alert(err.message);
                    return ;
                }
                isLoadData = true;
                $scope.units = data.units;
                $scope.$apply();
            });
        }
    });

}
