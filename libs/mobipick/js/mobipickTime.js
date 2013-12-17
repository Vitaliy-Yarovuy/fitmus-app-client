/*
 * Mobi Pick - An Android-style datepicker widget for jQuery Mobile.
 * 
 * Created by Christoph Baudson.
 *
 * Please report issues at https://github.com/sustainablepace/mobipick/issues
 *
 * Version 0.9
 *
 * Licensed under MIT license, see MIT-license.txt
 */
( function( $, undefined ){
$.widget( "sustainablepace.mobipickTime", $.mobile.widget, {
	options: {
		date            : null,
		dateFormat      : "mm:ss",
		//dateFormatMinute : "yyyy-MM",
		//dateFormatYear  : "yyyy",
		locale          : "en",
		intlStdDate     : true,
		buttonTheme     : "b",
		popup           : { 
			dismissible: false,
			history: false,
			overlayTheme: "a",
			positionTo: "window",
			theme: "a",
			transition: "pop"
		}
	},
	// Controller
	_picker: $( [] ),
	widgetEventPrefix: "mobipickTime",
	destroy: function() {
		this._close();
		this.element.off( "tap click" );
		this._picker.popup( "destroy" );
		$.Widget.prototype.destroy.call( this );
	},
	_create: function() {
		this._initOptions();          // parses options
		this._createView();           // inserts markup into DOM
		this.element.on( "tap click", $.proxy( this._open, this ) );
	},
	_initOptions: function() {
		var date    = this.element.val()         || this.options.date;

		if( date ) {
			this._setOption( "date", date );
		}
		this._setOption( "locale", this.options.locale );
	},
	_init: function() {
		// fill input field with default value
		if( this._getDate() !== null ) {
			this.updateDateInput();
		}
	},
	_open: function( evt ) {
		evt.stopPropagation();
		evt.preventDefault();
        var date    = this.element.val()         || this.options.date;
        if( date ) {
            this._setOption( "date", date );
        }
		this._setOption( "date",         date );
		this._setOption( "originalDate", this._getDate()       );

		this._showView();
		this._updateView();
		this._bindEvents();
	},
	_bindEvents: function() {
		var self    = this,
		    p       = this._picker,
		    confirm = $.proxy( this._confirmDate,     this ),
		    cancel  = $.proxy( this._cancelDate,      this ),
		    esc     = $.proxy( this._cancelDateOnEsc, this );
		
		// Set and Cancel buttons
		p.find( ".mobipick-set"    ).off().on( "tap", confirm );
		p.find( ".mobipick-cancel" ).off().on( "tap", cancel  );
		$( document ).off( "keyup", esc ).on( "keyup", esc );
		
		// +/- Buttons
		var selectorMap = {
			".mobipick-prev-second"   : "_prevSecond",
			".mobipick-prev-minute" : "_prevMinute",
			".mobipick-next-second"   : "_nextSecond",
			".mobipick-next-minute" : "_nextMinute"
		};
		for( var selector in selectorMap ) {
			(function() {
				var handler = self[ selectorMap[ selector ] ];
				p.find( selector ).off().on( "tap", $.proxy( function() {
					return self._handleDate( handler );
				}, self ));
			})();
		}
	},
	_close: function() {
		this._hideView();
	},
	_handleDate: function( dateHandler ) {
		this._setOption( "date", dateHandler.apply( this ) );
		return false;
	},
	_confirmDate: function() {
		var proceed    = true,
		    dateDiff   = this._getDate().diffDays( this.options.originalDate ),
		    hasChanged = dateDiff !== 0 || this.element.val() === "";
		
		if( this.options.close && typeof this.options.close === "function" ) {
			proceed = this.options.close.call() !== false;
		}
		if( proceed && hasChanged ) {
			this._setOption( "originalDate", this._getDate() );
			this.updateDateInput();
			this.element.trigger("change");
			this.element.trigger("change.time");
		} else {
			this._setOption( "date", this.options.originalDate );
		}
		this._close();
		return false;
	},
	_cancelDate: function() {
		this._setOption( "date", this.options.originalDate );
		this._close();
		return false;
	},
	_cancelDateOnEsc: function( evt ) {
		if( evt.keyCode === 27 ) {
			this._cancelDate();
		}
	},
	_setOption: function( key, val ) {
		switch( key ) {
			case "date":
				var sane = this._sanitizeDate( val );
				this.options[ key ] = sane ? sane.toDate() : sane;
				break;
			case "originalDate":
				this.options[ key ] = this._sanitizeDate( val ).toDate();
				break;
			case "intlStdDate":
				this.options[ key ] = !!val;
				break;
			case "locale":
				this.options[ key ] = this._isValidLocale( val ) ? val : "en";
				break;
			default:
				// Do not update view!
				return $.Widget.prototype._setOption.apply( this, arguments );
		}
		this._updateView();
	},
	//
	// Model
	//
	_sanitizeDate: function( date ) {
		if( date === null ) {
			return null;
		}
		var d = date;
		if( typeof d === "string" ) {
            var d0 = d.split(":")[0];
            var d1 = d.split(":")[1];
			d = new XDate(1970,1,1,0,d0,d1);
		}		
		if( this._isXDate( d ) ) {
			d = d.toDate();
		}
		if( !this._isDate( d ) ) {
			throw "Parameter 'date' must be a Date.";
		}
		return new XDate( d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() ,d.getMinutes(), d.getSeconds() );
	},
	_getDateFormat: function() {
        return "dateFormat";
	},
	dateString: function() {
		var format = this._getDateFormat(),
		    date   = this._getDate();
		return !date ? '' : date.toString( this.options[ format ] );
	},
	localeString: function() {
        var format = this._getDateFormat(),
            date   = this._getDate();
        return !date ? '' : date.toString( this.options[ format ] );
	},
	_isValidLocale: function( l ) {
		return typeof l === "string" && XDate.locales && XDate.locales[ l ];
	},
	_isDate: function( d ) {
		return typeof d === "object" && d !== null && d.constructor === Date;
	},
	_isXDate: function( x ) {
		return typeof x === "object" && x !== null && x.constructor === XDate;
	},
	_getDate: function() {
		var date = this.options.date;
		return this._isDate( date ) ? new XDate( date ) : null;
	},
	_getSecond: function( d ) {
		return this._isDate( d ) ? d.getSeconds() : this._getDate().getSeconds();
	},
	_getMinute: function( d ) {
		return this._isDate( d ) ? d.getMinutes() : this._getDate().getMinutes();
	},
	_prevSecond: function() {
		return this._addSecond( -1 );
	},
	_nextSecond: function() {
		return this._addSecond( 1 );
	},
	_prevMinute: function() {
		return this._addMinute( -1 );
	},
	_nextMinute: function() {
		return this._addMinute( 1 );
	},
	_addMinute: function( m ) {
		var date     = this._getDate(),
		    minute    = date.getMinutes(),
		    newMinute = ( 60 + minute + m ) % 60;
		return date.setMinutes( newMinute, true );
	},
	_addSecond: function( s ) {
        var date     = this._getDate(),
            seconds    = date.getSeconds(),
            newSeconds = ( 60 + seconds + s ) % 60;
        return date.setSeconds( newSeconds, true );
	},
	
	//
	// View
	//
	_markup: "<div class='mobipick-main'><div class='mobipick-date-formatted'>Date</div><ul class='mobipick-groups'><li><ul><li><a class='mobipick-next-minute'>+</a></li><li><input type='text' class='mobipick-input mobipick-minute' /></li><li><a class='mobipick-prev-minute'>-</a></li></ul></li><li><ul><li><a class='mobipick-next-second'>+</a></li><li><input type='text' class='mobipick-input mobipick-second' /></li><li><a class='mobipick-prev-second'>-</a></li></ul></li></ul><ul class='mobipick-buttons'><li><a class='mobipick-set'>Set</a></li><li><a class='mobipick-cancel'>Cancel</a></li></ul></div>",
	_applyTheme: function() {
		var p       = this._picker,
		    buttons = {
		        "bottom": "ul.mobipick-groups ul > li:first-child > a",
		        "top":    "ul.mobipick-groups ul > li:last-child > a"
		    };

		for( var key in buttons ) {
			p.find( buttons[ key ] ).addClass( "ui-corner-all" )
				.css( "border-" + key + "-left-radius", "0")
				.css( "border-" + key + "-right-radius", "0");
		}
		p.addClass( "ui-body-" + this.options.popup.theme + " ui-corner-all" );
		p.find( "a" ).attr( "href", "#" )
			.addClass( "ui-body-" + this.options.buttonTheme );
		p.find( "ul.mobipick-buttons a" ).addClass( "ui-corner-all" );
		p.find( "input" )
			.attr( "readonly", "readonly" ).addClass( "ui-shadow-inset" );
	},
	_createView: function() {
		this.element.attr( "readonly", "readonly" );
		this._picker = $( this._markup ).popup( this.options.popup );
		$.data( this.element, "mobipick", this );
		this._applyTheme();
	},
	_updateView: function() {
		var date = this._getDate(),
		    p    = this._picker;

		if( this._isXDate( date ) ) {
			p.find( ".mobipick-minute" ).val( date.toString( "mm"  ) );
			p.find( ".mobipick-second"   ).val( date.toString( "ss"   ) );
			p.find( ".mobipick-date-formatted" ).text( this.localeString() );
		}
		var locale = {};
		if( this._isValidLocale( this.options.locale ) ) {
			XDate.defaultLocale = this.options.locale;
			locale = XDate.locales[ this.options.locale ];
		}

		p.find( ".mobipick-set"    ).text( locale.ok     || "Set"    );
		p.find( ".mobipick-cancel" ).text( locale.cancel || "Cancel" );

		// Display items based on accuracy setting
		var columns = p.find( ".mobipick-groups > li" )
			.removeClass( "mobipick-hide" )
			.addClass( "mobipick-inline-block" );

        p.css( "max-width", "280px" );

		// minus 1% margin (left and right) per column
		var columnCount = 2;//columns.filter( ":visible" ).size(),
		    width       = ( ( 100 - columnCount * 2 ) / columnCount ) + "%";
		columns.css( "width", width );
	},
	_showView: function() {
		this._picker.show().popup("open").focus();
	},
	_hideView: function() {
		this._picker.popup("close");
	},
	updateDateInput: function() {
		this.element.val( this.options.intlStdDate ? 
			this.dateString() : this.localeString() 
		);
	}
});
}( jQuery ) );
