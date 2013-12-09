'use strict';

/* Controllers */

function AuthCtrl($scope, connect) {

    $scope.user="u1u1u1";
    $scope.pass="t1t1t1";

    $scope.login = function(){
        $.mobile.loading( 'show', {
            text: "loading",
            textVisible: true,
            theme: "b",
            textonly: false,
            html: ""
        });
        connect.login($scope.user,$scope.pass,function(err, data){
            if(err){
                $.mobile.loading("hide");
                alert(err.message);
                return ;
            }
            connect.getAll(function(err,data){
                if(err){
                    $.mobile.loading("hide");
                    alert(err.message);
                    return ;
                }
                $.mobile.loader("hide");
                console.log(data);
                setTimeout(function(){
                    location.hash = "#main_page";
                },0)
            });
        });
        return false;
    };

}
