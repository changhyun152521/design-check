// top_menu
$(document).ready(function() {
	$('#top_nav .list').hover(function(){
		$(this).addClass("mouse_on");
	}, function() {
		$(this).removeClass("mouse_on");
	});

	$('#bookmark').on('click', function(e) {
		var bookmarkURL = window.location.href;
		var bookmarkTitle = document.title;
		var triggerDefault = false;

		if (window.sidebar && window.sidebar.addPanel) {
			window.sidebar.addPanel(bookmarkTitle, bookmarkURL, '');
		} else if ((window.sidebar && (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)) || (window.opera && window.print)) {
			var $this = $(this);
			$this.attr('href', bookmarkURL);
			$this.attr('title', bookmarkTitle);
			$this.attr('rel', 'sidebar');
			$this.off(e);
			triggerDefault = true;
		} else if (window.external && ('AddFavorite' in window.external)) {
			window.external.AddFavorite(bookmarkURL, bookmarkTitle);
		} else {
			alert((navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Cmd' : 'Ctrl') + '+D 키를 눌러 즐겨찾기에 등록하실 수 있습니다.');
		}

		return triggerDefault;
	});

	$('#top_nav li').hover(function() {
		$('ul', this).slideDown(300);
	}, function() {
		$('ul', this).slideUp(100);
	});

	/* 모바일 햄버거 메뉴 */
	function closeUserMenus() {
		$(".mc-user-menu").removeClass("is-open")
			.find(".mc-user-menu__trigger").attr("aria-expanded", "false");
	}

	function navOpen() {
		closeUserMenus();
		$("#m_navBtn").addClass("on").attr({
			"aria-expanded": "true",
			"aria-label": "메뉴 닫기"
		});
		$("#navWrap").attr("aria-hidden", "false").stop(true, true).show();
		// 한 프레임 뒤 슬라이드 인
		requestAnimationFrame(function () {
			$("#navWrap").addClass("on");
		});
		$("body").addClass("mc-nav-open");
	}

	function navClose() {
		$("#m_navBtn").removeClass("on").attr({
			"aria-expanded": "false",
			"aria-label": "메뉴 열기"
		});
		$("#navWrap").removeClass("on").attr("aria-hidden", "true");
		setTimeout(function () {
			if (!$("#navWrap").hasClass("on")) {
				$("#navWrap").hide();
			}
		}, 320);
		$("#topmenuM .m_smenu").stop(true, true).hide();
		$("#topmenuM .m_bmenu").removeClass("on").attr("aria-expanded", "false");
		$("body").removeClass("mc-nav-open");
		closeUserMenus();
	}

	$("#m_navBtn").on("click", function(e) {
		e.preventDefault();
		e.stopPropagation();
		closeUserMenus();
		if ($("#navWrap").hasClass("on")) {
			navClose();
		} else {
			navOpen();
		}
	});

	// 어두운 오버레이(메뉴 바깥) 클릭 시 닫기
	$("#navWrap").on("click", function(e) {
		if (!$(e.target).closest(".inner").length) {
			navClose();
		}
	});

	$(document).on("keydown", function (e) {
		if (e.key === "Escape" && ($("#navWrap").hasClass("on") || $("body").hasClass("mc-nav-open"))) {
			navClose();
		}
	});

	// 대분류 아코디언: 같은 항목 다시 누르면 접힘
	$("#topmenuM .m_bmenu").on("click", function(e) {
		e.preventDefault();
		var $btn = $(this);
		var $sub = $btn.next(".m_smenu");

		if ($btn.hasClass("on")) {
			$btn.removeClass("on").attr("aria-expanded", "false");
			$sub.stop(true, true).slideUp(200);
			return;
		}

		$("#topmenuM .m_smenu").not($sub).stop(true, true).slideUp(200);
		$("#topmenuM .m_bmenu").removeClass("on").attr("aria-expanded", "false");
		$btn.addClass("on").attr("aria-expanded", "true");
		$sub.stop(true, true).slideDown(200);
	});

	/* 로그인 사용자 환영 메뉴 토글 */
	$(document).on("click", ".mc-user-menu__trigger", function(e) {
		e.preventDefault();
		e.stopPropagation();
		var $menu = $(this).closest(".mc-user-menu");
		var willOpen = !$menu.hasClass("is-open");

		$(".mc-user-menu").not($menu).removeClass("is-open")
			.find(".mc-user-menu__trigger").attr("aria-expanded", "false");

		if (willOpen) {
			$menu.addClass("is-open");
			$(this).attr("aria-expanded", "true");
		} else {
			$menu.removeClass("is-open");
			$(this).attr("aria-expanded", "false");
		}
	});

	$(document).on("click", function(e) {
		if ($(e.target).closest(".mc-user-menu").length) {
			return;
		}
		$(".mc-user-menu").removeClass("is-open")
			.find(".mc-user-menu__trigger").attr("aria-expanded", "false");
	});

	$(document).on("click", ".mc-user-menu__panel", function(e) {
		e.stopPropagation();
	});
});
