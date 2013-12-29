(function( $, undefined ) {

    $.widget( "mobile.textinput", $.mobile.textinput, {
        initSelector: "input[type='text']:not(.no-jqm-widget)," +
            "input[type='search']:not(.no-jqm-widget)," +
            ":jqmData(type='search'):not(.no-jqm-widget)," +
            "input[type='number']:not(.no-jqm-widget)," +
            ":jqmData(type='number'):not(.no-jqm-widget)," +
            "input[type='password']:not(.no-jqm-widget)," +
            "input[type='email']:not(.no-jqm-widget)," +
            "input[type='url']:not(.no-jqm-widget)," +
            "input[type='tel']:not(.no-jqm-widget)," +
            "textarea:not(.no-jqm-widget)," +
            "input[type='time']:not(.no-jqm-widget)," +
            "input[type='date']:not(.no-jqm-widget)," +
            "input[type='month']:not(.no-jqm-widget)," +
            "input[type='week']:not(.no-jqm-widget)," +
            "input[type='datetime']:not(.no-jqm-widget)," +
            "input[type='datetime-local']:not(.no-jqm-widget)," +
            "input[type='color']:not(.no-jqm-widget)," +
            "input:not([type]):not(.no-jqm-widget)," +
            "input[type='file']:not(.no-jqm-widget)",
        options: {
            inputHide:false
        },

        _create: function() {
            this._super();
            this._setInputHide(this.options.inputHide);
        },

        _setInputHide: function(state) {
            this.widget().css("display",state?"none":"");
        },

        _setOptions: function( options ) {
            this._super( options );
            this._setInputHide(this.options.inputHide);
        },

        _destroy: function() {
            this._super();
            this._setInputHide(false);
        }

    });

    $.mobile.History.prototype.add =(function(oldFunction){
        return function(url, data){
            if(url.indexOf("#") != -1){
                console.log("history add", url, data);
                oldFunction.call(this, url, data);
            }
        };
    })($.mobile.History.prototype.add);

    $.mobile.History.prototype.clear = function(){
        this.stack = [];
        this.activeIndex = 0;
    };


    var ua = navigator.userAgent.toLowerCase();
    if(ua.indexOf('msie') != -1){
        $("body").addClass("ie");
    }
})( jQuery );