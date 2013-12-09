'use strict';

app.factory('navigation',function ($rootScope){
    var page_name,
        pagesChangeListener = {},
        pagesLeaveListener = {};
    $(document).bind( "pagebeforechange", _.busy(function( e, data ) {
        var page = data.absUrl.split("#")[1].split("?")[0],
            strParams = data.absUrl.split("?")[1]||"",
            params = strParams.split("/");
        console.log("pagebeforechange",page,params);
        if(pagesChangeListener[page]){
            pagesChangeListener[page].forEach(function(listener){
                listener.apply(window,params);
            });
        }
        if(pagesLeaveListener[page_name]){
            pagesLeaveListener[page_name].forEach(function(listener){
                listener.apply(window,params);
            });
        }
        page_name = page;
    },350));

    return {
        beforePageChange: function(page, callback){
            if(pagesChangeListener[page]){
                pagesChangeListener[page].push(callback);
            }else{
                pagesChangeListener[page] = [callback];
            }
        },
        beforePageLeave: function(page, callback){
            if(pagesLeaveListener[page]){
                pagesLeaveListener[page].push(callback);
            }else{
                pagesLeaveListener[page] = [callback];
            }
        }
    };
});