$(document).ready(function() {
	
	$('.terugbellen__bedankt').hide();

	$('.employer-known').hide();

	function showBedankt() {

		$('#callback-form').hide(); 
		$('.terugbellen__bedankt').show();

	}

	function hideBedankt() {

		$('#callback-form').show(); 
		$('.terugbellen__bedankt').hide();

	}	

	$('#lnksend').removeAttr('disabled').click(function() { 
	
		showBedankt();

	});

	$('.terugbellen__bedankt').click(function() {

		hideBedankt();		

	});

	$('#phoneNumber').bind("enterKey",function(e){
	   showBedankt();
	});

	$('#phoneNumber').keyup(function(e){
		if(e.keyCode == 13)
		{
			$(this).trigger("enterKey");
		}
	});	// .keyup

	var mq = ssm.getCurrentStates()[0].id;

	$(window).load(function(){

		var widgetHeight = $('.main-widget').outerHeight();
		var introHeight = $('.tblock--intro').outerHeight();
		var actieHeight = $('.tblock--actie').outerHeight();
		var contactHeight = $('.tblock--contact').outerHeight();

		var introWidgetHeight = Math.max(introHeight, widgetHeight);
		var introActieContactHeight = Math.max(introHeight, actieHeight, contactHeight);
		var actieContactHeight = Math.max(actieHeight, contactHeight);

		console.log(actieHeight);
		console.log(contactHeight);
		console.log(introActieContactHeight);	
		console.log(actieContactHeight);


		if (mq === 'tablet') {

			$('.tblock--intro, .main-widget').css('height', introWidgetHeight + 'px');
			$('.tblock--actie, .tblock--contact').css('height', actieContactHeight + 'px');	
			
		} // tablet

		if (mq === 'desktop') {

			$('.tblock--intro, .tblock--actie, .tblock--contact').css('height', introActieContactHeight + 'px');	
			
		} // desktop		

	}); // .load



});