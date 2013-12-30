'use strict';

app.factory('message',function ($rootScope){
    return {
        /**
         * alert message
         * @param message
         * @param callback
         */
        alert: function(message, callback){
            navigator.notification.alert(
                message,                   // message
                callback || function(){},  // callback
                'Внимание',                // title
                'хорошо'                   // buttonName
            );
        },
        /**
         * confirm action
         * @param message
         * @param callback
         */
        confirm: function(message, callback){
            navigator.notification.confirm(
                message,                  // message
                callback || function(){}, // callback to invoke with index of button pressed
                'Подтверждение',          // title
                'подтвердить,отменить'      // buttonLabels
            );
        }
    };
});