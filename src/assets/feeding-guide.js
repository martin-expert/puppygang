
// context
var do_ui_updates			= false;
var has_pet_profiles		= false;
var pet_profiles_count		= 0;
var pet_profiles_match		= 0;
var pet_profiles_max		= 3;
var weight_override			= false;

// current pet
var pet_profile				= [];
var pet_profile_index		= -1;


/*
GLOBALS
********************************************************************/

// current product
var current_price			= 0;
//var product_weight_g		= 0;
var cost_per_g				= 0;
//var product_kcal_g			= 0;

// pet profiles: shared default values
var default_weight_unit				= 'lb';

// pet profiles: cat default values
var default_is_kitten				= 'no';
var default_physique				= 'ideal';
var default_weight_cat				= 8;
var default_weight_cat_min			= 2;
var default_weight_cat_max			= 30;
var default_weight_mature_cat_min	= 4;
var default_weight_mature_cat_max	= 20;

// pet profiles: dog default values
var default_is_puppy				= 'no';
var default_weight_dog				= 10;
var default_weight_dog_mature		= 20;
var default_weight_dog_min			= 4;
var default_weight_dog_max			= 100;
var default_weight_mature_dog_min	= 1;
var default_weight_mature_dog_max	= 20;

// selectors
var sel_button_save		= '#fg-save';
var sel_mature_weight	= '#fg-weight-wrapper-mature';

// feeding guide mode
if( typeof fg_pet_type == 'undefined' )
	var fg_pet_type = '';


/*
JQUERY: EVENT HANDLERS
********************************************************************/

(function($){

	/*
	PAGE INIT
	*/

	function check_if_has_pet_profiles() {
		if( typeof pet_profiles == 'object' ) {
			if( typeof pet_profiles.pets == 'object' )
				return true;
		}
		return false;
	}

	$(document).ready(function() {

		// feeding guide
		if( $('.fg').length > 0 ) {

			/*
			PET PROFILES
			*/

			// check if pet profiles are available
			has_pet_profiles = check_if_has_pet_profiles();

			// setup pet profiles
			var index_matched_by_type = -1;
			for( x=0; x < pet_profiles_max; x++ ) {
				// create blank profiles where empty
				if( typeof pet_profiles.pets[x] == 'undefined' )
					setup_new_pet_profile( x );
				// find first matching pet by meal type (cat, dog)
				if( index_matched_by_type < 0 && pet_profiles.pets[x].pet_type == fg_pet_type ) {
					index_matched_by_type = x;
				}
				// set button name
				if( pet_profiles.pets[x].pet_name != '' ) {
					$('#pet-profile-' + x).text( pet_profiles.pets[x].pet_name );
				}
			}

			// set first pet
			if( index_matched_by_type < 0 )
				index_matched_by_type = 0;
			switch_pet( index_matched_by_type );

			// setup buttons: pet selector
			/*
			$('.pet-selector button').on('click', function(){
				$(this).blur();
				if( $(this).hasClass('disabled') ) {
					return false;
				}
				count = parseInt($(this).attr('data-num')) + 1;
				switch_pet( count );
			});
			*/

			$('#fg-pet-name').on('change', function(){
				update_pet_profile_attribute( pet_profile_index, 'pet_name', $(this).val() );
			});

			$('#fg-breed-cat').on('change', function(){
				update_pet_profile_attribute( pet_profile_index, 'pet_breed_cat', $(this).val() );
			});

			$('#fg-breed-dog').on('change', function(){
				update_pet_profile_attribute( pet_profile_index, 'pet_breed_dog', $(this).val() );
			});

			/*
			FEEDING GUIDE
			*/

			// setup feeding guide
			initFeedingGuide();

			/*
			OTHER
			*/

			// setup tooltip
			$('[data-toggle="tooltip"]').tooltip({
				// settings: https://www.w3schools.com/bootstrap/bootstrap_ref_js_tooltip.asp
				html: true
			});

		}

	});

	/*
	PET PROFILES: DATA LAYER
	*/

	function add_cat() {

	}

	function add_dog() {

	}

	// setup new profile
	function setup_new_pet_profile( index ) {
		reset_fg_save_button();
		// set all default values
		update_pet_profile_attribute( index, 'pet_type',		fg_pet_type );
		update_pet_profile_attribute( index, 'pet_name',		'' );
		update_pet_profile_attribute( index, 'pet_breed_cat',	'' );						// cat only
		update_pet_profile_attribute( index, 'is_kitten',		'' );						// cat only
		update_pet_profile_attribute( index, 'physique',		'' );						// cat only
		update_pet_profile_attribute( index, 'pet_breed_dog',	'' );						// dog only
		update_pet_profile_attribute( index, 'is_puppy',		'' );						// dog only
		update_pet_profile_attribute( index, 'weight',			0 );
		update_pet_profile_attribute( index, 'weight_mature',	0 );
		update_pet_profile_attribute( index, 'weight_unit',		default_weight_unit );
		// dog only
		if( fg_pet_type == 'dog' ) {
			update_pet_profile_attribute( index, 'is_puppy',		default_is_puppy );
			update_pet_profile_attribute( index, 'weight',			default_weight_dog );
			update_pet_profile_attribute( index, 'weight_mature',	default_weight_dog_mature );
		}
		// cat only
		if( fg_pet_type == 'cat' ) {
			update_pet_profile_attribute( index, 'is_kitten',		default_is_kitten );
			//update_pet_profile_attribute( index, 'physique',		default_physique );
			update_pet_profile_attribute( index, 'weight',			default_weight_cat );
			update_pet_profile_attribute( index, 'weight_mature',	default_weight_cat_mature );
		}
	}

	// update profile attribute
	function update_pet_profile_attribute( index, attr, value ) {
		if( index < 0 ) {
			return;
		}
		switch( attr ) {
			case 'pet_type':
				pet_profiles.pets[index].pet_type = value;
				break;
			case 'pet_name':
				pet_profiles.pets[index].pet_name = value;
				break;
			case 'pet_breed_cat':
				pet_profiles.pets[index].pet_breed_cat = value;
				break;
			case 'pet_breed_dog':
				pet_profiles.pets[index].pet_breed_dog = value;
				break;
			case 'is_kitten':
				if( fg_pet_type == 'dog' ) {
					value = '';
				}
				pet_profiles.pets[index].is_kitten = value;
				break;
			case 'is_puppy':
				if( fg_pet_type == 'cat' ) {
					value = '';
				}
				pet_profiles.pets[index].is_puppy = value;
				break;
			case 'physique':
				if( fg_pet_type == 'dog' ) {
					value = '';
				}
				pet_profiles.pets[index].physique = value;
				break;
			case 'weight':
				value = parseFloat(value);
				pet_profiles.pets[index].weight = value;
				break;
			case 'weight_mature':
				value = parseFloat(value);
				pet_profiles.pets[index].weight_mature = value;
				break;
			case 'weight_unit':
				pet_profiles.pets[index].weight_unit = value;
				break;
		}
		if( do_ui_updates ) {
			enable_fg_save_button();
		}
	}

	/*
	PET PROFILE: CHANGE PET
	*/

	// event: change pet
	function switch_pet( index ) {
		// setup
		pet_profile_index	= index;
		pet_profile			= pet_profiles.pets[pet_profile_index];
		// mark button as active
		$('.pet-selector button').removeClass('btn-primary');
		$('#pet-profile-' + pet_profile_index).addClass('btn-primary');
		// setup form
		if( typeof pet_profile.pet_name == 'undefined' )
			setup_new_pet_profile( pet_profile_index );
		set_feeding_guide_pet( pet_profile_index );
	}

	// event: known pet selected
	function set_feeding_guide_pet( pet_profile_index ) {
		// suspend UI updates
		do_ui_updates = false;
		// setup: profile
		var pet_profile			= pet_profiles.pets[pet_profile_index];
		// set pet type if missing
		if( pet_profile.pet_type == '' ) {
			pet_profile.pet_type = fg_pet_type;
		}
		// clear form settings
		$('#fg-pet-name').val( '' );
		$('#fg-breed-cat').val( '' );
		$('#fg-breed-dog').val( '' );
		$('#fg-is-kitten').attr( 'checked', false );
		$('#fg-is-puppy').attr( 'checked', false );
		// set button properties
		$('#pet-profile-' + pet_profile_index).data( 'is-pet', 1 );
		$('#pet-profile-' + pet_profile_index).text( pet_profile.pet_name );
		$('#pet-profile-' + pet_profile_index).addClass('btn-primary');
		// set name
		$('#fg-pet-name').val( pet_profile.pet_name );
		// core setup
		if( pet_profile.pet_type == 'cat' ) {
			// hide dog-only elements
			$('.fg-dog-only').hide();
			$('.fg-cat-only').show();
			$('#fg-weight-wrapper-mature').hide();
			// show cat-only elements
			if( !$('#fg-pet-physique-wrapper').is(':visible') ) {
				$('#fg-pet-physique-wrapper').show();
			}
			// set weight slide min/max (default values)
			$('#fg-slide-weight').attr('min', default_weight_cat_min );
			$('#fg-slide-weight').attr('max', default_weight_cat_max );
			// cat breed
			$('#fg-breed-cat').val( pet_profile.pet_breed_cat );
			// conditional: is kitten
			if( pet_profile.is_kitten == 'yes' ) {
				$('#fg-is-kitten').attr( 'checked', true );
				if( !$(sel_mature_weight).is(':visible') )
					$(sel_mature_weight).slideDown();
			} else {
				if( $(sel_mature_weight).is(':visible') )
					$(sel_mature_weight).slideUp();
			}
			/*
			// set physique
			switch( pet_profile.physique ) {
				case 'chubby':
					$('#fg-physique-chubby').removeClass('btn-secondary');
					$('#fg-physique-chubby').addClass('btn-primary');
					break;
				case 'skinny':
					$('#fg-physique-skinny').removeClass('btn-secondary');
					$('#fg-physique-skinny').addClass('btn-primary');
					break;
				default:
					$('#fg-physique-ideal').removeClass('btn-secondary');
					$('#fg-physique-ideal').addClass('btn-primary');
					update_pet_profile_attribute( pet_profile_index, 'physique', 'ideal' );
					break;
			}
			*/
			// UI refresh
			$('#fg-breed-cat').trigger('change');
		} else {
			// hide cat-only elements
			$('.fg-cat-only').hide();
			$('.fg-dog-only').show();
			//$('#fg-pet-physique-wrapper').hide();
			// set weight slide min/max (default values)
			$('#fg-slide-weight').attr('min', default_weight_dog_min );
			$('#fg-slide-weight').attr('max', default_weight_dog_max );
			$('#fg-slide-weight-mature').attr('min', default_weight_mature_dog_min );
			$('#fg-slide-weight-mature').attr('max', default_weight_mature_dog_max );
			// dog breed
			$('#fg-breed-dog').val( pet_profile.pet_breed_dog );
			// conditional: is puppy
			if( pet_profile.is_puppy == 'yes' ) {
				$('#fg-is-puppy').attr( 'checked', true );
				if( !$(sel_mature_weight).is(':visible') )
					$(sel_mature_weight).slideDown();
			} else {
				if( $(sel_mature_weight).is(':visible') )
					$(sel_mature_weight).slideUp();
			}
			// UI refresh
			$('#fg-breed-dog').trigger('change');
		}
		// set current weight
		if( pet_profile.unit == 'kg' ) {
			$('#fg-weight-kg').trigger('click');
		} else {
			$('#fg-weight-lb').trigger('click');
		}
		$('#fg-weight').val( pet_profile.weight );
		$('#fg-weight-mature').val( pet_profile.weight_mature );
		// update pet weight unit
		if( pet_profile.pet_weight_unit == 'kg' ) {
			$('.btn-fg-weight-kg').trigger('click');
		} else {
			$('.btn-fg-weight-lb').trigger('click');
			update_pet_profile_attribute( pet_profile_index, 'weight_unit', 'lb' );
		}
		// refresh UI
		do_ui_updates = true;
		reset_fg_save_button();
		refreshFeedingGuide();
	}

	/*
	PET PROFILE: IS PUPPY
	*/

	// toggle: puppy on/off
	$('#fg-is-baby').on('click', function(e){

		// get pet profile
		var pet_profile = pet_profiles.pets[pet_profile_index];
		// set pet type if missing
		//if( pet_profile.pet_type == '' ) {
		//	pet_profile.pet_type = fg_pet_type;
		//}
		// set profile attribute name
		if( fg_pet_type == 'cat' )
			this_attribute = 'is_kitten';
		else
			this_attribute = 'is_puppy';
		// do updates
		if( $(this).is(':checked') ) {
			// update profile
			update_pet_profile_attribute( pet_profile_index, this_attribute, 'yes' );
			// move and update weight
			var weight_mature = parseFloat(pet_profile.weight);
			$('#fg-weight-mature').val( weight_mature );
			var weight = Math.round(weight_mature/2, 0);
			$('#fg-weight').val( weight );
			update_pet_profile_attribute( pet_profile_index, 'weight', weight );
			update_pet_profile_attribute( pet_profile_index, 'weight_mature', weight_mature );
			// weight ranges: get min/max from "current weight"
			var slide_min = $('#fg-slide-weight').attr('min');
			var slide_max = $('#fg-slide-weight').attr('max');
			// weight ranges: set "mature weight" with min/max
			$('#fg-slide-weight-mature').attr('min', slide_min);
			$('#fg-slide-weight-mature').attr('max', slide_max);
			// weight ranges: update "current weight" min/max
			if( slide_min > 1 ) {
				$('#fg-slide-weight').attr('min', 1);
				$('#fg-slide-weight').attr('max', slide_min);
			} else {
				$('#fg-slide-weight').attr('min', 1);
				$('#fg-slide-weight').attr('max', 20);
			}
			// show mature weight slider
			if( !$(sel_mature_weight).is(':visible') )
				$(sel_mature_weight).show();
		} else {
			// update profile
			update_pet_profile_attribute( pet_profile_index, this_attribute, 'no' );
			// move and update weight
			var weight = parseFloat(pet_profile.weight_mature);
			$('#fg-weight').val( weight );
			update_pet_profile_attribute( pet_profile_index, 'weight', weight );
			update_pet_profile_attribute( pet_profile_index, 'weight_mature', weight_mature );
			// weight ranges: get min/max from "mature weight"
			var slide_min = $('#fg-slide-weight-mature').attr('min');
			var slide_max = $('#fg-slide-weight-mature').attr('max');
			// weight ranges: set "current weight" with min/max
			$('#fg-slide-weight').attr('min', slide_min);
			$('#fg-slide-weight').attr('max', slide_max);
			// hide mature weight slider
			if( $(sel_mature_weight).is(':visible') )
				$(sel_mature_weight).hide();
		}
		// refresh UI
		$('.fg .fg-weight').trigger('change');
	});

	/*
	PET PROFILE: CAT PHYSIQUE
	*/

	/*
	$('.fg-physique').on('click', function(){
		// setup
		$(this).blur();
		if( $(this).hasClass('btn-primary') )
			return;
		// reset classes for all pet physique buttons
		$('.fg-physique').addClass('btn-secondary');
		$('.fg-physique').removeClass('btn-primary');
		// get selected id and set classes for selected pet physique button
		var ele_id = $(this).attr('id');
		$(this).addClass('btn-primary');
		$(this).removeClass('btn-secondary');
		// get selected value
		var pet_physique = $(this).attr('data-physique');
		// update data model and refresh UI
		update_pet_profile_attribute( pet_profile_index, 'physique', pet_physique );
		refreshFeedingGuide();
	});
	*/


	/*
	PET PROFILE: WEIGHT TEXT BOX
	*/

	// select all text on focus
	$(".fg-weight").focus(function(){
		$(this).select();
	});

	// keypress: permitted key filter
	$('.fg-weight').on('keydown', function( event ){
		if( event.which > 47 && event.which < 58 ) {
			// clicked: 0-9
			return true;
		} else {
			// check for specific keys
			switch( event.which ) {
				case 8:					// backspace
				case 9:					// tab
				case 13:				// enter
					return true;
			}
		}
		// ignore everything else
		return false;
	});

	// on change: update local data model and refresh UI
	$('.fg-weight').on('change', function(){
		// get attributes
		var weight_dom_id = get_parent_attribute_by_selector( this, '.fg-weight-wrapper', 'id' );
		var weight_group  = get_parent_attribute_by_selector( this, '.fg-weight-wrapper', 'data-weight-group' );
		var weight = get_forced_integer( $(this).val(), 0 );
		// require DOM id
		if( weight_dom_id == false )
			return;
		// continue ...
		$(weight_dom_id + ' .fg-slide-weight').attr( 'value', weight );
		if( weight_group == 'mature' )
			update_pet_profile_attribute( pet_profile_index, 'weight_mature', weight );
		else
			update_pet_profile_attribute( pet_profile_index, 'weight', weight );
		refreshFeedingGuide();
	});

	/*
	PET PROFILE: WEIGHT SLIDER
	*/

	// on change: update local data model and refresh UI
	$(document).on('input', '.fg input[type="range"]', function() {
		// get attributes
		var weight_dom_id = get_parent_attribute_by_selector( this, '.fg-weight-wrapper', 'id' );
		var weight_group  = get_parent_attribute_by_selector( this, '.fg-weight-wrapper', 'data-weight-group' );
		// require DOM id
		if( weight_dom_id == false )
			return;
		// continue ...
		var slide_weight = $(this).val();
		var slide_weight_min = $(this).attr('min');
		var slide_weight_max = $(this).attr('max');
		if( weight_group == 'mature' ) {
			$('#fg-weight-mature').val( slide_weight );
			update_pet_profile_attribute( pet_profile_index, 'weight_mature', slide_weight );
		} else {
			$('#fg-weight').val( slide_weight );
			update_pet_profile_attribute( pet_profile_index, 'weight', slide_weight );
		}
		refreshFeedingGuide();
	});

	function convert_slide_min_max_to_lb( selector ) {
		// min weight
		min_weight = $( selector ).attr( 'min' );
		min_weight = convert_kg_to_lb( min_weight );
		$( selector ).attr( 'min', min_weight );
		// max weight
		max_weight = $( selector ).attr( 'max' );
		max_weight = convert_kg_to_lb( max_weight );
		$( selector ).attr( 'max', max_weight );
	}

	function convert_slide_min_max_to_kg( selector ) {
		// min weight
		min_weight = $( selector ).attr( 'min' );
		min_weight = convert_lb_to_kg( min_weight );
		$( selector ).attr( 'min', min_weight );
		// max weight
		max_weight = $( selector ).attr( 'max' );
		max_weight = convert_lb_to_kg( max_weight );
		$( selector ).attr( 'max', max_weight );
	}

	/*
	PET PROFILE: UNIT WEIGHT BUTTONS
	*/

	$('.btn-fg-weight-lb').on('click', function() {
		$(this).blur();
		// ignore if already active
		if( $(this).hasClass('btn-primary') )
			return;
		// update buttons
		$('.btn-fg-weight-lb').addClass('btn-primary');
		$('.btn-fg-weight-lb').removeClass('btn-secondary');
		$('.btn-fg-weight-kg').addClass('btn-secondary');
		$('.btn-fg-weight-kg').removeClass('btn-primary');
		// update units and weight
		unit = 'lb';
		weight = get_selector_weight_in_lb( '#fg-weight' );
		weight_mature = get_selector_weight_in_lb('#fg-weight-mature' );
		update_pet_profile_attribute( pet_profile_index, 'weight', 'weight' );
		update_pet_profile_attribute( pet_profile_index, 'weight_mature', 'weight_mature' );
		update_pet_profile_attribute( pet_profile_index, 'weight_unit', 'lb' );
		// update slider min/max
		convert_slide_min_max_to_lb( '#fg-slide-weight' );
		convert_slide_min_max_to_lb( '#fg-slide-weight-mature' );
		// update slider min/max: mature weight
		min_weight = $('#fg-slide-weight-mature').attr('min');
		min_weight = $('#fg-slide-weight-mature').attr('max');
		// refresh form
		$('.fg .fg-weight').trigger('change');
	});

	$('.btn-fg-weight-kg').on('click', function(){
		$(this).blur();
		// ignore if already active
		if( $(this).hasClass('btn-primary') )
			return;
		// update buttons
		if( $('.btn-fg-weight-lg').length > 0 )
			alert('yes');
		$('.btn-fg-weight-lb').addClass('btn-secondary');
		$('.btn-fg-weight-lb').removeClass('btn-primary');
		$('.btn-fg-weight-kg').addClass('btn-primary');
		$('.btn-fg-weight-kg').removeClass('btn-secondary');
		// update units and weight
		unit = 'lb';
		weight = get_selector_weight_in_kg( '#fg-weight' );
		weight_mature = get_selector_weight_in_kg('#fg-weight-mature' );
		update_pet_profile_attribute( pet_profile_index, 'weight', 'weight' );
		update_pet_profile_attribute( pet_profile_index, 'weight_mature', 'weight_mature' );
		update_pet_profile_attribute( pet_profile_index, 'weight_unit', 'kg' );
		// update slider min/max
		convert_slide_min_max_to_kg( '#fg-slide-weight' );
		convert_slide_min_max_to_kg( '#fg-slide-weight-mature' );
		// refresh form
		$('.fg .fg-weight').trigger('change');
	});

	/*
	PET PROFILE: SAVE BUTTON
	*/

	function reset_fg_save_button() {
		// CSS
		$(sel_button_save).addClass('disabled');
		$(sel_button_save).addClass('btn-secondary');
		$(sel_button_save).removeClass('btn-primary');
		// event
		$(sel_button_save).unbind('click');
	}

	function enable_fg_save_button() {
		// CSS
		$(sel_button_save).removeClass('disabled');
		$(sel_button_save).removeClass('btn-secondary');
		$(sel_button_save).addClass('btn-primary');
		// event
		$(sel_button_save).on('click', function(e){
			alert('save changes');
		});
	}

	/*
	FEEDING GUIDE: SETUP AND INITIALIZATION
	*/

	function initFeedingGuide() {

		// required inputs
		if( $('#product_kcal_g').length == 0 ) {
			console.log( 'Feeding guide: #product_kcal_g required' );
			return;
		}
		if( $('#product_weight_g').length == 0 ) {
			console.log( 'Feeding guide: #product_weight_g required' );
			return;
		}
		if( $('#current_price').length == 0 ) {
			console.log( 'Feeding guide: #current_price required' );
			return;
		}

		// wire up pet profiles
		//initPetProfiles();

		// all values must be greater than 0
		product_kcal_g = parseFloat( $('#product_kcal_g').val() );
		if( product_kcal_g == 0 ) {
			console.log( 'Feeding guide: product_kcal_g must be greater than 0' );
			return;
		}
		product_weight_g = parseFloat( $('#product_weight_g').val() );
		if( product_weight_g == 0 ) {
			console.log( 'Feeding guide: product_weight_g must be greater than 0' );
			return;
		}
		current_price = parseFloat( $('#current_price').val() );
		if( current_price == 0 ) {
			console.log( 'Feeding guide: current_price must be greater than 0' );
			return;
		}

		// pre-calculated values
		cost_per_g = current_price / product_weight_g;

		// button hover effects
		$('.fg .mode-toggle .button')
			.mouseover(function(){
				//
			})
			.mouseleave(function(){
				//
			});

		// initialize UI and show guide
		$('.fg input[type="range"]').trigger( 'input' );
		$('.fg').fadeIn();

	}

	/*
	FEEDING GUIDE: CALCULATE RESULTS
	*/

	function refreshFeedingGuide() {

		// don't proceed if UI updates are suspended
		if( !do_ui_updates )
			return;

		// get pet profile settings
		pet_profile			= pet_profiles.pets[pet_profile_index];
		pet_type			= pet_profile.pet_type;
		is_kitten			= pet_profile.is_kitten;
		is_puppy			= pet_profile.is_puppy;
		pet_physique		= pet_profile.physique;
		pet_weight			= parseFloat( pet_profile.weight );
		pet_weight_mature	= parseFloat( pet_profile.weight_mature );
		pet_weight_unit		= pet_profile.weight_unit;

		if( pet_type == '' )
			pet_type = fg_pet_type;

		// require: weight
		if( pet_weight < 1 ) {
			console.log( 'Skip refresh: weight < 1' );
		}

		if( pet_type == 'dog' && is_puppy == 'yes' ) {
			if( pet_weight_mature < 1 ) {
				console.log( 'Skip refresh: mature weight < 1' );
			}
		}

		if( pet_type == 'cat' && is_kitten == 'yes' ) {
			if( pet_weight_mature < 1 ) {
				console.log( 'Skip refresh: mature weight < 1' );
			}
		}

		//console.log( 'pet_weight = ' + pet_weight );
		//console.log( 'pet_weight_mature = ' + pet_weight_mature );

		// convert lb to kg
		if( pet_weight_unit == 'lb' ) {
			pet_weight = Number(pet_weight * 0.15).toFixed(3);
			pet_weight_mature = Number(pet_weight_mature * 0.15).toFixed(3);
		}

		// update: KCal per day
		if( pet_type == 'cat' ) {

			//console.log( 'pet_type = ' + pet_type );
			//console.log( 'is_kitten = ' + is_kitten );
			//console.log( 'pet_physique = ' + pet_physique );

			if( is_kitten == 'yes' ) {
				kcal_per_day = Math.round(100 * Math.pow(pet_weight, 0.67) * 6.7 * (Math.exp((-0.189 * (pet_weight/pet_weight_mature))) - 0.60), 0);
			} else {
				kcal_per_day = Math.round(90 * Math.pow(pet_weight, 0.67), 0);
			}

			/*
			switch( pet_physique ) {
				case 'chubby':
					kcal_per_day = Math.round(130 * Math.pow(pet_weight, 0.4), 0);
					break;
				case 'skinny':
					kcal_per_day = Math.round(100 * Math.pow(pet_weight, 0.67), 0);s
					break;
				default:
					// ideal
					kcal_per_day = Math.round(100 * Math.pow(pet_weight, 0.67), 0);
					break;
			}
			*/

		} else {

			/*
			console.log( 'pet_type = ' + pet_type );
			console.log( 'is_puppy = ' + is_puppy );
			*/

			if( is_puppy == 'yes' ) {
				kcal_per_day = Math.round(130 * Math.pow(pet_weight, 0.75) * 3.2 * (Math.exp((-0.87 * (pet_weight/pet_weight_mature)) - 0.1)), 0);
			} else {
				kcal_per_day = Math.round(95 * Math.pow(pet_weight, 0.75), 0);
			}

		}

		$('#kcal_per_day').text( kcal_per_day );

		//console.log( 'pet_weight = ' + pet_weight );
		//console.log( 'pet_weight_mature = ' + pet_weight_mature );
		//console.log( 'pet_weight_unit = ' + pet_weight_unit );
		//console.log( 'product_weight_g = ' + product_weight_g );
		//console.log( 'product_kcal_g = ' + product_kcal_g );
		//console.log( 'current_price = ' + current_price );

		// update: grams per day
		var g_per_day = parseInt(kcal_per_day/product_kcal_g);
		$('#g_per_day').text( g_per_day );
		// update: packages per day
		var pkg_per_day_100 = Number(g_per_day/product_weight_g).toFixed(2);
		var pkg_per_day_60  = Number(pkg_per_day_100 * 0.60).toFixed(2);
		var pkg_per_day_50  = Number(pkg_per_day_100 * 0.5).toFixed(2);
		$('#pkg_per_day_100').text( pkg_per_day_100 );
		$('#pkg_per_day_60').text( pkg_per_day_60 );
		$('#pkg_per_day_50').text( pkg_per_day_50 );
		// update: packages per week
		var pkg_per_week_100 = Number(g_per_day/product_weight_g * 7).toFixed(2);
		var pkg_per_week_60  = Number(pkg_per_week_100 * 0.60).toFixed(2);
		var pkg_per_week_50  = Number(pkg_per_week_100 * 0.5).toFixed(2);
		$('#pkg_per_week_100').text( pkg_per_week_100 );
		$('#pkg_per_week_60').text( pkg_per_week_60 );
		$('#pkg_per_week_50').text( pkg_per_week_50 );
		// update: packages per month
		var pkg_per_month_100 = Number(g_per_day/product_weight_g * 30).toFixed(2);
		var pkg_per_month_60  = Number(pkg_per_month_100 * 0.60).toFixed(2);
		var pkg_per_month_50  = Number(pkg_per_month_100 * 0.5).toFixed(2);
		$('#pkg_per_month_100').text( pkg_per_month_100 );
		$('#pkg_per_month_60').text( pkg_per_month_60 );
		$('#pkg_per_month_50').text( pkg_per_month_50 );
		// update: bulk discounts
		var discount_100 = get_bulk_discount_for_monthly_packages(pkg_per_month_100);
		var discount_60  = get_bulk_discount_for_monthly_packages(pkg_per_month_60);
		var discount_50  = get_bulk_discount_for_monthly_packages(pkg_per_month_50);
		// update: base costs
		var cost_per_day_100 = Number(cost_per_g * g_per_day).toFixed(2);
		var cost_per_day_60  = Number(cost_per_day_100 * 0.60).toFixed(2);
		var cost_per_day_50  = Number(cost_per_day_100 * 0.5).toFixed(2);
		// update: discounted cost
		if( discount_100 > 0 ) {
			cost_per_day_100 = Number(cost_per_day_100 - cost_per_day_100 * discount_100/100).toFixed(2);
		}
		if( discount_60 > 0 ) {
			cost_per_day_60 = Number(cost_per_day_60 - cost_per_day_60 * discount_60/100).toFixed(2);
		}
		if( discount_50 > 0 ) {
			cost_per_day_50 = Number(cost_per_day_50 - cost_per_day_50 * discount_50/100).toFixed(2);
		}
		// update UI
		$('#cost_per_day_100').text( cost_per_day_100 );
		$('#cost_per_day_60').text( cost_per_day_60 );
		$('#cost_per_day_50').text( cost_per_day_50 );
		// update: VIP badges
		if( pkg_per_month_100 >= 30 ) {
			$('.check-badge-100').addClass('badge');
			$('.check-badge-100').addClass('badge-success');
		} else {
			$('.check-badge-100').removeClass('badge');
			$('.check-badge-100').removeClass('badge-success');
		}
		if( pkg_per_month_60 >= 30 ) {
			$('.check-badge-60').addClass('badge');
			$('.check-badge-60').addClass('badge-success');
		} else {
			$('.check-badge-60').removeClass('badge');
			$('.check-badge-60').removeClass('badge-success');
		}
		if( pkg_per_month_50 >= 30 ) {
			$('.check-badge-50').addClass('badge');
			$('.check-badge-50').addClass('badge-success');
		} else {
			$('.check-badge-50').removeClass('badge');
			$('.check-badge-50').removeClass('badge-success');
		}
		// show feeding guide if hidden
		if( !$('.fg-results').is(':visible') ) {
			$('.fg-results').fadeIn();
		}
	}

	function get_bulk_discount_for_monthly_packages( pkg_per_month ) {
		if( pkg_per_month >= 120 ) {
			return 25;
		} else if( pkg_per_month >= 80 ) {
			return 20;
		} else if( pkg_per_month >= 60 ) {
			return 15;
		} else if( pkg_per_month >= 50 ) {
			return 10;
		} else if( pkg_per_month >= 30 ) {
			return 5;
		}
		return 0;
	}

	/*
	HELPERS: AJAX
	*/

	function updatePetProfiles() {
		// show AJAX loader
		ajaxSubmitPre( '#str-main' );
		// post updates
		jQuery.ajax({
			type: 'POST',
			dataType: 'json',
			url: ajax_object.ajaxurl,
			data: {
				'action'	   : 'ajax_save_feeding_guide_profiles',
				'pet_profiles' : pet_profiles
			},
			success: function( data ){
				if ( data.result == true ){
					// OK
					alert( 'OK' );
					// close AJAX loader
					ajaxSubmitPost();
				} else {
					// failed to load room
					alert( 'Response error: ' + data.message );
					// close AJAX loader
					ajaxSubmitPost();
				}
			},
			error: function( request, status, error ){
				// close spinning AJAX loader
				ajaxSubmitPost();
				alert( 'Error: ' + error );
			}
		});
	}

	function ajaxSubmitPre( selector ) {
		// TODO
	}

	function ajaxAfterSubmit() {
		// TODO
	}

})(jQuery);
