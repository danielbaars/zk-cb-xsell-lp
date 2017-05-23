(function($) {
    yepnope({
        test: Modernizr.csscolumns,
        nope: 'js/jquery.columnizer.js',
        complete: function() {
            if($('html').hasClass('no-csscolumns')) {
                $('.woonverzekering__text').columnize({ columns: 3 });
                $('.woonverzekering__intro, .woonverzekering__list').css("padding-right", "20px");
                $('.woonverzekering').css("padding-bottom", "15px");
            }
        }
    });
})(jQuery);