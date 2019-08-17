
/*
SETUP
********************************************************************/

// utility variables
var last_body_class = '';       // last class added to DOM body to indicate current Bootstrap breakpoint
var has_page_blocks = false;

// objects
var audio_player;

// object properties
var audio_player_default_filename  = TS_WEBSITE_URL+ '/assets/audio/file.mp3';

// misc jQuery DOM selectors
var selector_order_received_pickup_map = 'body.woocommerce-order-received #pickup-location';
var selector_order_received_shipto     = 'body.woocommerce-order-received .woocommerce-order section.container .row .col-12:nth-child(2)';

// config: batch field processing
var supported_batch_field_types = [ 'input', 'textarea', 'select' ];

// state tracking
var form_submitted = false;


/*
JQUERY: EVENT HANDLERS
********************************************************************/

(function($){

	update_current_bootstrap_breakpoint_body_class();
	$('.autohide').removeClass('autohide');

	$(document).ready(function() {

		// init objects
		//init_objects_audio();

		// event handlers
		// init_events_audio();
		init_events_base();				// visibility toggles, header/footer, nav events
		init_events_shop_loop();		// eg, +/- change quantity buttons
		init_events_overlay();			// eg, open/close overlay
		init_events_ajax();

		// elements (which may have their own event handlers)
		init_elements_home_sliders();
		init_elements_autoresize();

		// pages
		init_checkout_thankyou();

		// WooCommerce thank you page
		if( $(selector_order_received_pickup_map).length > 0 ) {
			$(selector_order_received_shipto).html( $(selector_order_received_pickup_map).html() );
		}
		$(selector_order_received_shipto).fadeIn();

		$(window).trigger('resize');

	});

	// on load: on-time events
	$(window).on("load",function(e){
		init_elements_page_blocks();
	});

	// on load and resize: shared events
	$(window).on("load resize",function(e){

		resizeboxes();

		// page blocks
		if( has_page_blocks ) {
			resize_page_blocks();
		}

		update_current_bootstrap_breakpoint_body_class();

	});

	function resize_page_blocks() {
		resize_page_blocks_by_inners();
	}

	function resize_page_blocks_by_inners() {
		var inners = [];
		var is_body_xs = $('body').hasClass('body-xs');
		var is_body_sm = $('body').hasClass('body-sm');
		// step 1: calculate max height by inner
		var last_offset_key;
		$('.ts-page-blocks .inner').each(function(){
			var ele_offset = $( this ).offset().top;
			var ele_key    = 'h_' + ele_offset;
			if( last_offset_key != ele_key ) {
				last_offset_key = ele_key;
			}
			if( typeof inners[ele_key] == 'undefined' )
				inners[ele_key] = 0;
			if( $(this).css('background-image') == 'none' ) {
				// text
				//if( is_body_xs ) {
				//	$(this).css( 'height', 'auto' );
				//} else {
					var text_height = parseInt($(this).height()
										+ parseInt($(this).css('padding-top'))
										+ parseInt($(this).css('padding-bottom')));
					if( inners[ele_key] < text_height ) {
						inners[ele_key] = parseInt(text_height);
					}
					$(this).css( 'height', inners[ele_key] + 'px' );
				//}
			} else {
				// dimensions: image
				var bg_width     = $(this).attr('data-bg-width');
				var bg_height    = $(this).attr('data-bg-height');
				var bg_ratio     = $(this).attr('data-bg-ratio');
				// dimensions: available
				var div_width	 = $(this).width();
				var width_ratio  = div_width/bg_width;
				// fit available space
				var new_width 	 = div_width;
				var new_height   = div_width*width_ratio;
				var new_ratio    = new_width/new_height;
				// test
				// calculate new dimensions
				if( bg_ratio >= 1 ) {
					// fit to height
					bg_height = parseInt(div_width / bg_ratio);
					bg_width  = bg_height * bg_ratio;
				} else {
					// fit to width
					bg_width = div_width;
					bg_height = parseInt(bg_width / bg_ratio);
				}
				// set max height
				if( inners[ele_key] < bg_height ) {
					inners[ele_key] = bg_height;
				}
				$(this).css( 'height', inners[ele_key] + 'px' );
			}
		});
		// step 2. set heights
		var last_offset_key;
		$('.ts-page-blocks .inner').each(function(){
			var ele_offset = $(this).offset().top;
			var ele_key    = 'h_' + ele_offset;
			if( last_offset_key != ele_key ) {
				last_offset_key = ele_key;
			}
			if( $(this).css('background-image') == 'none' ) {
				if( is_body_xs || is_body_sm ) {
					$(this).css( 'height', 'auto' );
				} else  {
					$(this).css( 'height', inners[ele_key] + 'px' );
				}
			} else {
				var div_width = $(this).width();
				$(this).css( 'height', inners[ele_key] + 'px' );
			}
		});
	}

	/*
	OBJECTS
	************************************************************************/

	/*
	function init_objects_audio() {
		audio_player = new Audio( audio_player_default_filename );
		audio_player.pause();
		audio_player.currentTime = 0;
	}
	*/

	/*
	EVENT HANDLERS
	************************************************************************/

	/*
	function init_events_audio() {
		if (audio_player.paused) {
			$("#music_toggle").attr("src", "./images/icons/music-icon.png");
			audio_player.play();
		} else {
			$("#music_toggle").attr("src", "./images/icons/music-icon-disabled.png");
			audio_player.pause();
		}
	}
	*/

	function init_events_base() {

		// show title in my account
		if( $('body.woocommerce-account').length > 0 ) {
			if( $('#customer_login').length == 0 ) {
				$('body.woocommerce-account .entry-content h1.entry-title').show();
			}
		}

		// general purpose: blur helper (add class for on-click events)
		$('.blur').on('click', function(){
			this.blur();
		});

		// general purpose: modal window, close
		$('.modal button.close-modal').on('click', function(){
			var modal = $(this).closest('.modal');
			$(modal).fadeOut();
			setTimeout(function(){
				$(modal).removeClass('show');
			},410);
		});

		// general purpose: visibility toggle helper
		$('.toggle').on('click', function() {
			var selector = $(this).attr('data-selector');
			if( $(selector).length > 0 ) {
				$( selector ).slideToggle();
				if( $(this).find('i.far.fa-plus-square').length > 0 ) {
					$(this).find('i.far').addClass('fa-minus-square');
					$(this).find('i.far').removeClass('fa-plus-square');
				} else if( $(this).find('i.far.fa-minus-square').length > 0 ) {
					$(this).find('i.far').addClass('fa-plus-square');
					$(this).find('i.far').removeClass('fa-minus-square');
				}
			}
			if( $(this).hasClass('scrolltop') ) {
				$("html, body").animate({ scrollTop: 0 }, "slow");
			}
		});

		// general purpose: DIV inter-linking
		$('.with-target').on('click', function(){
			this.blur();
			var target = $(this).attr('data-target');
			if( typeof target == 'undefined' )
				return;
			target = target.trim();
			if( target == '' )
				return;
			if( target.charAt(0) == '#' ) {
				if( $(target).length > 0 ) {
				var distance = $(target).offset().top;
				var speed = 2000;
				if( distance < 1250 )
					speed = 850;
				$('html, body').animate({
					scrollTop: distance - 160
				}, speed);
				}
			} else {
				window.location = target;
			}
		});

		// click: team member
		$('.team-member').on('click', function(){
			if( $(this).find('.team-bio').length == 0 )
				return;
			var title = $(this).find('.team-title').html();
			var bio   = $(this).find('.team-bio').html();
			$('#our-team-modal-title').html( title );
			$('#our-team-modal-bio').html( bio );
			//$('#our-team-modal').fadeIn();
			//$('#our-team-modal').addClass('show');
			$('#our-team-modal').modal({show:true});
		});

		// TODO: delete this
		//$('.toggle-nav').on('click', function(){
		//});

		// click: FAQ question
		$('.question .toggle').on('click', function(){
			this.blur();
			var target = $(this).attr('data-selector');
			if( typeof target == 'undefined' )
				return;
			target = target.trim();
			if( target == '' )
				return;
			if( $(target).length == 0 )
				return;
			if( $(target).height() > 50 )
				return;
			$('html,body').animate({
				// target offset - wrapper offset - div height - div parent top padding
				scrollTop: $(target).offset().top - $('.wrapper').offset().top - $(this).height() - 16
			});
		});

		/*
		HEADER: DESKTOP
		*/

		// desktop header: search visibility toggle
		var desktop_toggle_search_nav = false;
		$('#ts-navbar-full-search').on('click', function(){
			$(this).blur();
			// prevent double clicks
			if( desktop_toggle_search_nav )
				return;
			// do fade out
			desktop_toggle_search_nav = true;
			setTimeout(function(){
				desktop_toggle_search_nav = false;
			}, 810);
			// UI visibility toggle
			if( $('#desktop-nav-controls').is(':visible') ) {
				// get width of nav controls and fade it out
				var nav_control_width = $('#desktop-nav-controls').width();
				$('#desktop-nav-controls').fadeOut();
				setTimeout(function(){
					// set width of search form to match nav controls
					$('#desktop-nav-search-form input[type=text]').css( 'width', (nav_control_width) + 'px' );
					$('#desktop-nav-search-form').fadeIn();
				}, 400);
			} else {
				$('#desktop-nav-search-form').fadeOut();
				setTimeout(function(){
					$('#desktop-nav-controls').fadeIn();
				}, 400);
			}
		});

		/*
		HEADER: SEARCH
		*/

		$('.search-desktop').on('keyup', function( event ){
			switch( event.which ) {
				case 13: // enter
					var search_term = $(this).val().trim();
					if( search_term != '' ) {
						$('#desktop-nav-search-form').trigger('submit');
					}
					break;
			};
		});

		$('.search-mobile').on('keyup', function( event ){
			switch( event.which ) {
				case 13: // enter
					var search_term = $(this).val().trim();
					if( search_term != '' ) {
						$('#search-mobile').trigger('submit');
					}
					break;
			};
		});

		/*
		CART: CHANGE LOCATION
		*/

		$('#change-location-cart').on('click', function(){
			$(this).blur();
			if( $('.ts-first-navbar-mobile').is(':visible') ) {
				$('.overlay-open.ts-navbar-mobile-my-perks-button').trigger('click');
			} else {
				$('.toggle.ts-navbar-my-perks-button').trigger('click');
			}
		});

		/*
		HEADER: MOBILE
		*/

		// mobile header: toggle location
		$('#change-location-mobile-open').on('click', function(){
			$(this).blur();
			$('#perks-content-mobile').hide();
			$('#change-location-mobile').show();
		});

		// mobile header: toggle location
		$('#change-location-mobile-cancel').on('click', function(){
			if( form_submitted )
				return;
			$(this).blur();
			$('#change-location-mobile').hide();
			$('#perks-content-mobile').show();
		});

		// mobile header: change location "go"
		$('#change-location-mobile-go').on('click', function(){
			if( form_submitted )
				return;
			$('#change-location-mobile-form').submit();
		});

		// clear postal code when country is changed
		$('input[type=radio][name=new_country]').change(function() {
			$('input[type=text].change-location-postal').val('');
			$('input[type=text].change-location-postal').focus();
		});

		// select postal code value on focus
		$('.change-location-postal').on('focus', function(){
			$(this).select();
		});

		$('.change-location-postal').on('keyup', function( event ){
			switch( event.which ) {
				case 13: // enter
					$(this).closest('form').trigger('submit');
					break;
			};
		});

		$('#change-location-mobile-form').on('submit', function(){
			form_submitted = true;
		});

	}

	function init_events_shop_loop() {
		$('.add-1').on('click', function(){
			$(this).blur();
			var target = $(this).attr('data-target');
			if( !is_valid_target(target) )
				return;
			var qty = parseInt($(target).attr('data-quantity'));
			qty++;
			$(target).text('Add ' + qty + ' to Cart' );
			$(target).attr('data-quantity', qty);
		});
		$('.subtract-1').on('click', function(){
			$(this).blur();
			var target = $(this).attr('data-target');
			if( !is_valid_target(target) )
				return;
			var qty = parseInt($(target).attr('data-quantity'));
			if( qty > 1 ) {
				qty--;
				$(target).attr('data-quantity', qty);
				$(target).text('Add ' + qty + ' to Cart' );
			}
		});
	}

	function init_events_overlay() {
		$('.overlay-open').on('click', function(e){
			var selector = $(this).attr('data-selector');
			if( $(selector).length > 0 ) {
				var overlay_scroll = $(this).attr('data-scroll');
				if ( typeof attr !== typeof undefined && attr !== false )
					overlay_scroll = strings_to_bool(overlay_scroll, "true");
				else
					overlay_scroll = false;
				overlay_open( selector, overlay_scroll );
			}
		});
		$('.overlay-close').on('click', function(){
			var selector = $(this).attr('data-selector');
			if( $(selector).length > 0 ) {
				overlay_close( selector );
			}
			last_event_selector = '';
		});
	}

	function init_events_ajax() {
		$('.pet-profiles button.save').on('click', function(e) {
			e.stopPropagation();
			e.preventDefault();
			$(this).blur();
			release_hold = save_feeding_guide_pet_profiles();
			if( release_hold )
				ajax_submitted = false;
		});
		$('footer button.btn-subscribe').on('click', function(e) {
			e.stopPropagation();
			e.preventDefault();
			$(this).blur();
			release_hold = subscribe_to_newsletter_via_footer();
			if( release_hold )
				ajax_submitted = false;
		});
	}

	/*
	SETUP/CONFIG PAGE ELEMENTS
	************************************************************************/

	function init_elements_home_sliders() {
		if( $('#ts-tutorial-slider').length > 0 ) {
			$('#ts-tutorial-slider').carousel({
				interval: 5000
			});
		}
		if( $('#ts-tutorial-slider-mobile').length > 0 ) {
			$('#ts-tutorial-slider-mobile').carousel({
				interval: 5000
			});
		}
	}

	function init_elements_page_blocks() {
		if( $('.ts-page-blocks').length == 0 )
			return;
		has_page_blocks = true;
		// add background image height to div data attribute
		$('.ts-page-blocks .row .inner').each(function(){
			if( $(this).css('background-image') == 'none' )
				return true;
			// set default height of 0
			//$(this).data( 'bg-height', '0px' );
			if( $(this).css('background-image') != 'none' ) {
				var img = new Image();
				var bg_url = $(this).css('background-image').replace(/^url|[\(\)]/g, '').replace( /\"|\'|\)/g, '' );
				img.src = bg_url;
				$(this).attr( 'data-bg-width', img.width );
				$(this).attr( 'data-bg-height', img.height );
				$(this).attr( 'data-bg-ratio', img.width / img.height );
			}
		});
	}

	function init_elements_autoresize() {
		// add autoresize class to form elements
		if( $('#order_comments').length > 0 ) {
			$('#order_comments').addClass('autoresize');
		}
		// auto-resizing textareas
		$('textarea.autoresize').each(function () {
			this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
			}).on('input', function () {
				this.style.height = 'auto';
				this.style.height = (this.scrollHeight) + 'px';
		});
	}


	/*
	PAGE SETUP
	************************************************************************/

	function init_checkout_thankyou() {

		//return;

		/*
		VERIFICATION
		*/

		// only run this code on order received page
		if( $('body.woocommerce-order-received').length == 0 )
			return;

		/*
		BLOCKS: SETUP
		*/

		var order_head				= '';
		var order_details			= '';
		var pickup_block 			= '';
		var custom_fields			= '';
		var pickup_map				= '';

		var partner_pickup_name		= '';
		var partner_pickup_address	= '';

		var shipping_method 		= '';

		/*
		DELIVERY CONTEXT
		*/

		if( $('#custom-thankyou-layout').length == 0 )
			return;

		shipping_method = $('#custom-thankyou-layout').data('shipping-method');

		/*
		PRE-PROCESSING
		*/

		// remove customer note from order totals
		var td_note = $('table.shop_table.order_details tfoot tr th:contains("Note:")');
		if( $(td_note).length > 0 ) {
			var tr_note = $(td_note).closest('tr');
			if( $(tr_note).length > 0 ) {
				$(tr_note).css( 'display', 'none' );
			}
		}

		/*
		REPOSITIONING
		*/

		// penguin pickup: get map so we can move it
		if( shipping_method == 'pickup-location-method' && $(selector_order_received_pickup_map).length > 0 ) {
			pickup_map = $(selector_order_received_pickup_map);
			$(selector_order_received_pickup_map).remove();
		}

		// get blocks to move
		order_head 		= $('ul.order_details');
		order_details 	= $('table.shop_table.order_details');
		custom_fields	= $('.woocommerce-order table.custom-fields');

		// add blocks to custom layout
		$('#order-head .content').html( order_head );
		$('#order-details .content').html( order_details );

		// delivery option: Tom&Sawyer Retail Store Pickup
		if( shipping_method == 'local_pickup' ) {
			$('#order-details .content').html( $('#order-details .content').html().replace('VIP Delivery (Tuesday)', 'Tom&Sawyer Retail Store Pickup') );
			$('#order-details .content').html( $('#order-details .content').html().replace('VIP Delivery (Wednesday)', 'Tom&Sawyer Retail Store Pickup') );
			$('#order-shipto').append( '<div id="local-pickup-map" style="width:100%; height:300px;"></div>' );
			create_gmap( 'local-pickup-map', 43.6635054, -79.3302608, 14, false, 'Tom&amp;Sawyer Retail Store' );
		}

		// delivery option: Penguin Pickup
		if( shipping_method == 'pickup-location-method' ) {
			$('#order-details .content').html( $('#order-details .content').html().replace('VIP Delivery (Tuesday)', 'Penguin Pickup') );
			$('#order-details .content').html( $('#order-details .content').html().replace('VIP Delivery (Wednesday)', 'Penguin Pickup') );
			$('#order-shipto').append( pickup_map.html() );
			// $('#order-shipto').html( $('#order-shipto').html().replace('c/o ', '') );
		}

		/*
		FINALIZE
		*/

		// fade in
		$('#custom-thankyou-layout').fadeIn();

	}


	/*
	HELPERS: OVERLAYS
	************************************************************************/

	function overlay_open( selector, scroll ) {
		var wHeight = $(window).height();
		var wWidth  = $(window).width();
		if( wWidth < 993 && !selector.includes('-m') && selector != '#overlay-perks' && selector != '#overlay-pickup-locations' ) {
			selector += '-m';
		}
		$( selector ).fadeIn().css("display", "flex").css("right", "auto").css("left", "auto");
		if( !scroll ) {
			$('body').addClass('remove-scrolling');
			//document.getElementsByTagName('body')[0].classList.add('remove-scrolling');
		}
	}

	function overlay_close( selector ) {
		$( selector ).fadeOut().css("display", "hidden");
		$('body').removeClass('remove-scrolling');
		//document.getElementsByTagName('body')[0].classList.remove('remove-scrolling');
	}

	/*
	HELPERS: DOM MANIPULATION
	************************************************************************/

	function is_valid_target( target ) {
		if( typeof target == 'undefined' || target == '' )
			return false;
		if( $(target).length == 0 )
			return false;
		return true;
	}

	var resizeboxes = function() {
		if ($( document ).width() > 768) {
			$(".ts-remove-container").addClass("container");
		} else {
			$(".ts-remove-container").removeClass("container")
		}
	};

	/*
	HELPERS: DOM MANIPULATION
	************************************************************************/

	function strings_to_bool( $string, $match ) {
		if( $string == $match )
			return true;
		else
			return false;
	}

	/*
	HELPERS: AUDIO
	************************************************************************/

})(jQuery);


/*
HELPERS: JQUERY
****************************************************************************/

function get_parent_attribute_by_selector( obj, selector, attribute ) {
	$ = jQuery;
	var parent = $(obj).closest(selector);
	var parent_attr = parent.attr(attribute);
	if( typeof parent_attr == 'undefined' )
		return false;
	switch( attribute ) {
		case 'id':
			return '#' + parent_attr;
			break;
		default:
			return parent_attr;
	}
}

function get_selector_weight_in_lb( selector ) {
	$ = jQuery;
	if( $(selector).length == 0 )
		return 0;
	var weight = get_forced_float( $(selector).val(), 0 );
	//var weight = parseFloat( $(selector).val() );
	//if( isNaN(weight) )
	//	weight = 0;
	if( weight == 0 ) {
		$(selector).val( weight );
	} else {
		weight = convert_kg_to_lb( weight );
		$(selector).val( weight );
	}
	weight_override = true;
	return weight;
}

function get_selector_weight_in_kg( selector ) {
	$ = jQuery;
	if( $(selector).length == 0 )
		return 0;
	var weight = get_forced_float( $(selector).val(), 0 );
	//var weight = parseFloat( $(selector).val() );
	//if( isNaN(weight) )
	//	weight = 0;
	if( weight == 0 ) {
		$(selector).val( weight );
	} else {
		weight = convert_lb_to_kg( weight );
		$(selector).val( weight );
	}
	weight_override = true;
	return weight;
}

function switchClass( selector, cssAdd, cssRemove, skipIfMatch ) {
	$ = jQuery;
	// require: selector
	if( !selector )
		return skipIfMatch;
	// require: CSS class to add
	if( !cssAdd )
		return skipIfMatch;
	// don't proceed if the breakpoint hasn't changed
	if( skipIfMatch == cssAdd )
		return skipIfMatch;
	// do changes
	$(selector).addClass( cssAdd );
	if( cssRemove )
		$(selector).removeClass( cssRemove );
	return cssAdd;
}


/*
HELPERS: DOM
****************************************************************************/

// add class to body corresponding to Bootstrap breakpoints
function update_current_bootstrap_breakpoint_body_class() {
	$ = jQuery;
	var current_width = $(window).width();
	if (current_width < 750) {
		last_body_class = switchClass( 'body', 'body-xs', 'body-sm body-md body-lg body-xl', last_body_class );
	} else if (current_width < 992) {
		last_body_class = switchClass( 'body', 'body-sm', 'body-xs body-md body-lg body-xl', last_body_class );
	} else if (current_width < 1170) {
		last_body_class = switchClass( 'body', 'body-md', 'body-xs body-sm body-lg body-xl', last_body_class );
	} else if (current_width < 1450) {
		last_body_class = switchClass( 'body', 'body-lg', 'body-xs body-sm body-md body-xl', last_body_class );
	} else {
		last_body_class = switchClass( 'body', 'body-xl', 'body-xs body-sm body-md body-lg', last_body_class );
	}
}


/*
HELPERS: CONVERSION
****************************************************************************/

function convert_lb_to_kg( weight_in_lb ) {
	if( weight_in_lb == 0 )
		return 0;
	weight_in_kg = Math.round((weight_in_lb / 2.20462), 1);
	return weight_in_kg;
}

function convert_kg_to_lb( weight_in_kg ) {
	if( weight_in_kg == 0 )
		return 0;
	weight_in_lb = Math.round((weight_in_kg * 2.20462), 1);
	return weight_in_lb;
}

function get_forced_integer( input_value, default_value ) {
	var result = parseInt(input_value);
	if( isNaN(result) )
		result = default_value;
	return result;
}

function get_forced_float( input_value, default_value ) {
	var result = parseFloat(input_value);
	if( isNaN(result) )
		result = default_value;
	return result;
}


/*
HELPERS: GOOGLE MAPS
****************************************************************************/

function create_gmap( selector_id, mapLat, mapLng, mapZoom, mapZontrol, markerTitle ) {
	var myLatLng = {lat: mapLat, lng: mapLng};
	pickup_map = new google.maps.Map(document.getElementById( selector_id ), {
								zoom: mapZoom,
								center: myLatLng,
								mapTypeControl: mapZontrol,
                				mapTypeId: google.maps.MapTypeId.ROADMAP
							});
	var marker = new google.maps.Marker({
		position: myLatLng,
		map: pickup_map,
		title: markerTitle
	});
}


/*
HELPERS: VALIDATION
****************************************************************************/

function is_valid_email(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function is_json(data) {
	try {
		JSON.parse(data);
	} catch(e) {
		return false;
	}
	return true;
}


/*
HELPERS: BATCH FIELD OPERAITONS (e.g., copy data)
****************************************************************************/

function clear_fields( selector ) {
	$.each( supported_batch_field_types, function(index, field_type) {
		$( selector + ' ' + field_type ).each( function(key, value) {
			switch( field_type ) {
				case 'input':
				case 'textarea':
					$(this).val('');
					break;
				case 'select':
					$(this).val('');
					var parent = $(this).closest('.woocommerce-input-wrapper');
					if( parent.length > 0 ) {
						$(parent).find('.select2-selection__rendered').text('');
					}
					break;
				case 'checkbox':
				case 'radio':
					$(this).prop('checked', false);
					break;
			}
		});
	});
}

/*
function copy_fields( selector, obj ) {
	shipto_copied = true;
	obj = {};
	$.each( supported_batch_field_types, function(index, field_type) {
		$( selector + ' ' + field_type ).each( function(key, value) {
			obj[this.name] = {
				id: this.id,
				type: field_type,
				value: this.value
			};
			console.log( this.name + ' ' + this.value );
		});
	});
	clear_fields( selector );
	console.log( shipto );
}

function write_fields( selector, obj ) {
	if( typeof obj === 'undefined' )
		return;
	Object.entries(obj).forEach(entry => {
		field_name  = entry[0];
		field_id    = entry[1].id;
		field_type  = entry[1].type;
		field_value = entry[1].value;
		switch( field_type ) {
			case 'input':
			case 'textarea':
				$( field_type + '[name="' + field_name + '"]' ).val( field_value );
				break;
			case 'select':
				$('#' + field_id)
					.removeAttr('selected')
					.find('option[value=' + field_value + ']')
					.attr('selected', true);
				$('#' + field_id).trigger('change');
				alert( field_name + ' = ' + $('#' + field_id).val() + ' (' + field_value + ')' );
				break;
			case 'checkbox':
			case 'radio':
				break;
		}
		console.log( field_name + ' / ' + field_type + ' / ' + field_value );
	});
}
*/
