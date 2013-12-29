'use strict';

app.factory('timeconverter',function ($rootScope){
    return {
        /**
         * convert data to timestamp with moscow time: 12 hours
         * @param year
         * @param month
         * @param day
         * @returns {number}
         */
        getMoscovTimeStamp: function(year, month, day){
            var date = new Date(year,month,day+1, 12 - 4 - (new Date()).getTimezoneOffset()/60, 0, 0 );
            return Math.floor(date.getTime()/1000);
        },
        /**
         * convert data to timestamp with moscow time: 12 hours
         * @param date
         * @returns {number}
         */
        convertDayToTimestamp: function(date){
            var aDate = date.split("-");
            return this.getMoscovTimeStamp(aDate[0],aDate[1]-1,aDate[2]-1);
        }
    };
});