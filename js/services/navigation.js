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
        /**
         * add listener to before change event
         * @param page
         * @param callback
         */
        beforePageChange: function(page, callback){
            if(pagesChangeListener[page]){
                pagesChangeListener[page].push(callback);
            }else{
                pagesChangeListener[page] = [callback];
            }
        },
        /**
         * add listener to before leave event
         * @param page
         * @param callback
         */
        beforePageLeave: function(page, callback){
            if(pagesLeaveListener[page]){
                pagesLeaveListener[page].push(callback);
            }else{
                pagesLeaveListener[page] = [callback];
            }
        },
        /**
         * refresh current page (generate change event for current page )
         */
        refresh:function(){
            if(pagesChangeListener[page_name]){
                pagesChangeListener[page_name].forEach(function(listener){
                    listener.apply(window,params);
                });
            }
        }
    };
});