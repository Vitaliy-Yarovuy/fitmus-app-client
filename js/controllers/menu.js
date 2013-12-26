'use strict';

/* Controllers */

function MenuCtrl($scope, connect, navigation, $rootScope, $sce) {

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
            $.mobile.changePage("#empty_page", {transition: "slideup"});
        },10)
        setTimeout(function(){
            connect.sync(function () {
                setTimeout(function(){
                    $.mobile.changePage("#"+page, {transition: "slideup"});
                    $.mobile.loading("hide");
                    setTimeout(function(){
                        $("#"+page).jqmData( "panel", null );
                    },800);
                },300);
            });
        },300);
    };

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


    jQuery(".main_menu-link").on("click", function () {
        jQuery("#main_menu").panel("toggle");
        return false;
    });
}
