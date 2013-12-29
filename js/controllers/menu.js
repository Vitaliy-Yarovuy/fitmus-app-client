'use strict';

/* Controllers */

function MenuCtrl($scope, connect, navigation, $rootScope, $sce) {

    /**
     * trigger to synchronize user data
     */
    $scope.sync = function () {
        jQuery("#main_menu").panel("close");
        $.mobile.loading('show', {
            text: "loading",
            textVisible: true,
            theme: "b",
            textonly: false,
            html: ""
        });
        var page = $.mobile.activePage.attr('id');
        setTimeout(function(){
            connect.sync(function () {
                setTimeout(function(){
                    navigation.refresh();
                    $.mobile.loading("hide");
                    setTimeout(function(){
                        $("#"+page).jqmData( "panel", null );
                    },600);
                },10);
            });
        },10);
    };

    /**
     * exit from app
     */
    $scope.exit = function () {
        jQuery("#main_menu").panel("close");
        $.mobile.loading('show', {
            text: "loading",
            textVisible: true,
            theme: "b",
            textonly: false,
            html: ""
        });
        connect.sync(function () {
            $.mobile.loading("hide");
            navigator.app && navigator.app.exitApp();
        });
    };


    /**
     * open/close menu
     */
    jQuery(".main_menu-link").on("click", function () {
        jQuery("#main_menu").panel("toggle");
        return false;
    });
}
