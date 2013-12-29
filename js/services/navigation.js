'use strict';

app.factory('navigation',function ($rootScope){
    var page_name,params,
        pagesChangeListener = {},
        pagesLeaveListener = {};
    $(document).bind( "pagebeforechange", /*_.busy(*/function( e, data ) {
        var strPage = data.absUrl.split("#")[1],
            page = strPage?strPage.split("?")[0]:"",
            strParams = data.absUrl.split("?")[1]||"";

        params = strParams.split("|");
        console.log("pagebeforechange",page,params);
        if(pagesChangeListener[page]){
            pagesChangeListener[page].forEach(function(listener){
                listener.apply(window,params);
            });
        }
        if(pagesLeaveListener[page_name]){
            pagesLeaveListener[page_name].forEach(function(listener){
                listener.apply(window);
            });
        }
        page_name = page;
        return true;
    }/*,350)*/);

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
        },
        refresh:function(){
            if(pagesChangeListener[page_name]){
                pagesChangeListener[page_name].forEach(function(listener){
                    listener.apply(window,params);
                });
            }
        }
    };
});