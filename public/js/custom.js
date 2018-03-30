(function ($) {

	$.fn.getIndex = function () {
		var $p = $(this).parent().children();
		return $p.index(this);
	}

	$.fn.extend({
		slideRight: function () {
			return this.each(function () {
				$(this).show();
			});
		},
		slideLeft: function () {
			return this.each(function () {
				$(this).hide();
			});
		},
		slideToggleWidth: function () {
			return this.each(function () {
				var el = $(this);
				if (el.css('display') == 'none') {
					el.slideRight();
				} else {
					el.slideLeft();
				}
			});
		}
	});

	$.fn.setNav = function () {
		$('#main_menu li ul').css({ display: 'none' });

		$('#main_menu li').each(function () {
			var $sublist = $(this).find('ul:first');

			$(this).hover(function () {
				$sublist.css({ opacity: 1 });

				$sublist.stop().css({ overflow: 'hidden', height: 'auto', display: 'none' }).fadeIn(200, function () {
					$(this).css({ overflow: 'visible', height: 'auto', display: 'block' });
				});
			},
				function () {
					$sublist.stop().css({ overflow: 'hidden', height: 'auto', display: 'none' }).fadeOut(200, function () {
						$(this).css({ overflow: 'hidden', display: 'none' });
					});
				});

		});

		$('#main_menu li').each(function () {

			$(this).hover(function () {
				$(this).find('a:first').addClass('hover');
			},
				function () {
					$(this).find('a:first').removeClass('hover');
				});

		});

		$('#menu_wrapper .nav ul li ul').css({ display: 'none' });

		$('#menu_wrapper .nav ul li').each(function () {

			var $sublist = $(this).find('ul:first');

			$(this).hover(function () {
				$sublist.css({ opacity: 1 });

				$sublist.stop().css({ overflow: 'hidden', height: 'auto', display: 'none' }).fadeIn(200, function () {
					$(this).css({ overflow: 'visible', height: 'auto', display: 'block' });
				});
			},
				function () {
					$sublist.stop().css({ overflow: 'hidden', height: 'auto', display: 'none' }).fadeOut(200, function () {
						$(this).css({ overflow: 'hidden', display: 'none' });
					});
				});

		});

		$('#menu_wrapper .nav ul li').each(function () {

			$(this).hover(function () {
				$(this).find('a:first').addClass('hover');
			},
				function () {
					$(this).find('a:first').removeClass('hover');
				});

		});
	}

	$(document).ready(function () {

		$(document).setNav();

		// $('a[rel=gallery]').fancybox({
		// 	padding: 0,
		// 	prevEffect: 'fade',
		// 	nextEffect: 'fade',
		// 	helpers: {
		// 		title: {
		// 			type: 'float'
		// 		},
		// 		overlay: {
		// 			opacity: 1,
		// 			css: {
		// 				'background-color': '#' + $('#skin_color').val()
		// 			}
		// 		},
		// 		thumbs: {
		// 			width: 80,
		// 			height: 80
		// 		}
		// 	}
		// });

		$('#move_next').fadeOut();
		$('#move_prev').fadeOut();

		$('.img_nofade').hover(function () {
			$(this).animate({ opacity: .5 }, 300);
		}
			, function () {
				$(this).animate({ opacity: 1 }, 300);
			}

		);

		$('input[title!=""]').hint();

		$('textarea[title!=""]').hint();

		// Create the dropdown base
		$("<select />").appendTo("#menu_border_wrapper");

		// Create default option "Go to..."
		$("<option />", {
			"selected": "selected",
			"value": "",
			"text": "- Main Menu -"
		}).appendTo("#menu_border_wrapper select");

		// Populate dropdown with menu items
		$(".nav li").each(function () {
			var current_item = $(this).hasClass('current-menu-item');
			var el = $(this).children('a');
			var menu_text = el.text();

			if ($(this).parent('ul.sub-menu').length > 0) {
				menu_text = "- " + menu_text;
			}

			if ($(this).parent('ul.sub-menu').parent('li').parent('ul.sub-menu').length > 0) {
				menu_text = el.text();
				menu_text = "- - " + menu_text;
			}

			if (current_item) {
				$("<option />", {
					"selected": "selected",
					"value": el.attr("href"),
					"text": menu_text
				}).appendTo("#menu_border_wrapper select");
			}
			else {
				$("<option />", {
					"value": el.attr("href"),
					"text": menu_text
				}).appendTo("#menu_border_wrapper select");
			}
		});

		$("#menu_border_wrapper select").change(function () {
			window.location = $(this).find("option:selected").val();
		});

		// prevent context-menu and image downloading
		$(window).contextmenu(function (e) {
			e.preventDefault();
			return false;
		});
		$("img").mousedown(function (e) {
			e.preventDefault();
			return false;
		});

	});

})(jQuery);
