(function(global,undefined){

//    jQuery(document).on('click','a[href*="#"]', function(e) {
//        location.hash = this.href.split("#")[1];
//        return false;
//    });

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
})(window);