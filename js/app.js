(function(global,undefined){
    function censor(censor) {
        var i = 0;
        return function(key, value) {
            if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
                return '[Circular]';
            if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
                return '[Unknown]';
            ++i; // so we know we aren't using the original object anymore
            return value;
        }
    }
//    jQuery(document).on('click','a[href*="#"]', function(e) {
//        location.hash = this.href.split("#")[1];
//        return false;
//    });
//    if ($.browser.msie && $.browser.version < 11) {
//        $("html").addClass("ie");
//    }
    jQuery( function() {
        $(".hide").removeClass("hide");
        jQuery( "body>[data-role='panel']" ).panel();


        $( "#cooment_popup" ).enhanceWithin().popup({
            align: "0.5,0.5"
        });
    });

    $.mobile.loading( 'show', {
        text: "loading",
        textVisible: true,
        theme: "b",
        textonly: false,
        html: ""
    });

    global.app = angular.module('fitApp',[]);
    app.run(function($rootScope,connect){
        if(connect.isLogin()){
            connect.getAll(function(err,data){
                if(err){
                    $.mobile.loading("hide");
                    alert(err.message);
                    return ;
                }
                $.mobile.loader("hide");
                console.log(data);
                setTimeout(function(){
                    $.mobile.changePage("#main_page",{transition:"slideup"});
                },0)
            });
        }else{
            $.mobile.loader("hide");
            $.mobile.changePage("#auth_page");
        }
    });
    global.onerror = function(){
        var arr = JSON.parse(localStorage["error-log"]||"[]");
        arr.push([].slice.call(arguments));
        localStorage["error-log"] = JSON.stringify(arr,censor(arr));
    }
})(window);