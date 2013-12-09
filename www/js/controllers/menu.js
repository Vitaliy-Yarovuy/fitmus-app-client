'use strict';

/* Controllers */

function MenuCtrl($scope, connect, navigation, $rootScope, $sce) {

   $scope.sync = function(){
        jQuery( "#main_menu" ).panel( "close" );
        $.mobile.loading('show');
        connect.sync(function(){
            $.mobile.loading("hide");
            location.hash = "#main_page";
        })
    };
}
