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
        connect.sync(function () {
            $.mobile.loading("hide");
            $.mobile.changePage("#main_page", {transition: "slideup"});
        })
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
        jQuery("#main_menu").panel("open");
        return false;
    });
}
