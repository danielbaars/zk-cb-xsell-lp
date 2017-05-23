$(document).ready(function() {
	
	ssm.addState({
	id: 'phone-tablet-small',
	maxWidth: 767,
	onEnter: function(){
	    $('[class^=sm-]').matchHeight('remove');
	    $('[class^=md-]').matchHeight('remove');
	}
	});

	ssm.addState({
	id: 'phone',
	maxWidth: 479,
	onEnter: function(){
		var pageTitle = $(document).prop('title');
	    $(document).prop('title', pageTitle + ' PHONE');
	}
	});	

	ssm.addState({
	id: 'phablet',
	minWidth: 480,
	maxWidth: 599,
	onEnter: function(){
		var pageTitle = $(document).prop('title');
	    $(document).prop('title', pageTitle + ' PHONE LANDSCAPE');
	}
	});		

	ssm.addState({
	id: 'tablet-small',
	minWidth: 600,
	maxWidth: 767,
	onEnter: function(){
		var pageTitle = $(document).prop('title');
	    $(document).prop('title', pageTitle + ' TABLET SMALL');
	}
	});	
	
	ssm.addState({
	id: 'tablet',
	minWidth: 768,
	maxWidth: 1023,
	onEnter: function(){
		var pageTitle = $(document).prop('title');
		$(document).prop('title', pageTitle + ' TABLET');
	    $('[class^=md-]').matchHeight('remove');
	    $('.sm-2nd').matchHeight();
	    $('.sm-3rd').matchHeight();
	    $('.sm-4th').matchHeight();
	    $('.sm-5th').matchHeight();
	    $('.sm-6th').matchHeight();
	    $('.sm-7th').matchHeight();
	    $('.sm-8th').matchHeight();
	    $('.sm-9th').matchHeight();
	    $('.footer-block').matchHeight();
	}
	});
	
	ssm.addState({
	id: 'desktop',
	minWidth: 1024,
	maxWidth: 1199,
	onEnter: function(){
		var pageTitle = $(document).prop('title');
		$(document).prop('title', pageTitle + ' DESKTOP');
	    $('[class^=sm-]').matchHeight('remove');
	    $('.md-2nd').matchHeight();
	    $('.md-3rd').matchHeight();
	    $('.md-4th').matchHeight();
	    $('.md-5th').matchHeight();
	    $('.md-6th').matchHeight();
	    $('.footer-block').matchHeight();   
	}
	});	

	ssm.addState({
	id: 'desktop-wide',
	minWidth: 1200,
	onEnter: function(){
		var pageTitle = $(document).prop('title');
	    $(document).prop('title', pageTitle + ' DESKTOP WIDE');
	    $('[class^=sm-]').matchHeight('remove');
	    $('.md-2nd').matchHeight();
	    $('.md-3rd').matchHeight();
	    $('.md-4th').matchHeight();
	    $('.md-5th').matchHeight();
	    $('.md-6th').matchHeight();
	    $('.footer-block').matchHeight(); 	    
	}
	});	
	
	ssm.ready();
    
	
});