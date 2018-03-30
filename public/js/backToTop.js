jQuery(function($) {

    $.ready();
    var defaults = {
        text: '',
        min: 200,
        margin: 20,
        fade_in: 600,
        fade_out: 400,
        speed: 600,
        easing: 'linear',
        id: 'backToTop'
    };

    var settings = $.extend(defaults, null);

    if (!settings.text) {
        settings.text = '<span></span>';
    }

    // create the DOM, hidden initially and add a click listener to it
    var $toTop = $('<a href=\"#\" id=\"' + settings.id + '\"></a>').html(settings.text).hide().appendTo('body').click(function () {
        $('html, body').stop().animate({ scrollTop: 0 }, settings.speed, settings.easing);
        return false;
    });

    // add scroll listener
    $(window).scroll(function () {
        var sd = jQuery(window).scrollTop();
        if (typeof document.body.style.maxHeight === "undefined") {
            $toTop.css({
                'position': 'absolute',
                'top': sd + $(window).height() - settings.margin
            });
        }
        if (sd > settings.min) {
            $toTop.fadeIn(settings.fade_in);
        } else {
            $toTop.fadeOut(settings.fade_out);
        }
    });

    // call it also now as the page can already have been scrolled
    $(window).scroll();

});
