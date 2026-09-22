(function () {
  var PAGES = {
    preview: { title: "맛보기강좌", parent: "내강의실", section: "classroom", active: "preview" },
    "my-courses": { title: "내강좌", parent: "내강의실", section: "classroom", active: "my-courses" },
    "qa-video": { title: "개별질문영상", parent: "내강의실", section: "classroom", active: "qa-video" },
    "student-progress": { title: "수업 현황", parent: "내교실", section: "student", active: "student-progress" },
    "student-test": { title: "테스트 현황", parent: "내교실", section: "student", active: "student-test" },
    "student-monthly": { title: "월별 통계", parent: "내교실", section: "student", active: "student-monthly" },
    "student-online": { title: "온라인 강의실", parent: "내교실", section: "student", active: "student-online" },
    "parent-progress": { title: "수업 현황", parent: "학부모교실", section: "parent", active: "parent-progress" },
    "parent-test": { title: "테스트 현황", parent: "학부모교실", section: "parent", active: "parent-test" },
    "parent-monthly": { title: "월별 통계", parent: "학부모교실", section: "parent", active: "parent-monthly" },
    notice: { title: "공지사항", parent: "커뮤니티", section: "community", active: "notice" },
    review: { title: "수강후기", parent: "커뮤니티", section: "community", active: "review" },
    inquiry: { title: "이용문의", parent: "커뮤니티", section: "community", active: "inquiry" },
    free: { title: "자유게시판", parent: "커뮤니티", section: "community", active: "free" },
    login: { title: "로그인", layout: "auth" },
    register: { title: "회원가입", layout: "auth" }
  };

  var SNB = {
    classroom: [
      { key: "preview", label: "맛보기강좌", href: "preview.html" },
      { key: "my-courses", label: "내강좌", href: "my-courses.html" },
      { key: "qa-video", label: "개별질문영상", href: "qa-video.html" }
    ],
    student: [
      { key: "student-progress", label: "수업 현황", href: "student-progress.html" },
      { key: "student-test", label: "테스트 현황", href: "student-test.html" },
      { key: "student-monthly", label: "월별 통계", href: "student-monthly.html" },
      { key: "student-online", label: "온라인 강의실", href: "student-online.html" }
    ],
    parent: [
      { key: "parent-progress", label: "수업 현황", href: "parent-progress.html" },
      { key: "parent-test", label: "테스트 현황", href: "parent-test.html" },
      { key: "parent-monthly", label: "월별 통계", href: "parent-monthly.html" }
    ],
    community: [
      { key: "notice", label: "공지사항", href: "notice.html" },
      { key: "review", label: "수강후기", href: "review.html" },
      { key: "inquiry", label: "이용문의", href: "inquiry.html" },
      { key: "free", label: "자유게시판", href: "free.html" }
    ]
  };

  function headerHtml() {
    return (
      '<div id="sh_hd" class="sub">' +
      '<div id="sh_hd_wrapper">' +
      '<div id="hd_gnb"><div class="hd_gnb_wrapper"><div class="menu_wrap"><div class="bookmark">' +
      '<a href="#bookmark" id="bookmark" title="즐겨찾기 등록"><p><i class="fa fa-bookmark" aria-hidden="true"></i>즐겨찾기</p></a>' +
      "</div></div></div></div>" +
      '<div id="top_nav_wrap"><div class="top_menu_wrap">' +
      '<div id="top_logo"><a href="index.html"><img src="img/common/logo_white.png" alt="이창현수학"></a></div>' +
      '<ul id="top_nav">' +
      '<li class="list list01"><a href="preview.html">내강의실</a><ul class="sub_ul1">' +
      '<li><a href="preview.html">맛보기강좌</a></li><li><a href="my-courses.html">내강좌</a></li><li><a href="qa-video.html">개별질문영상</a></li></ul></li>' +
      '<li class="list list02"><a href="student-progress.html">내교실</a><ul class="sub_ul2">' +
      '<li><a href="student-progress.html">수업 현황</a></li><li><a href="student-test.html">테스트 현황</a></li><li><a href="student-monthly.html">월별 통계</a></li><li><a href="student-online.html">온라인 강의실</a></li></ul></li>' +
      '<li class="list list03"><a href="parent-progress.html">학부모교실</a><ul class="sub_ul3">' +
      '<li><a href="parent-progress.html">수업 현황</a></li><li><a href="parent-test.html">테스트 현황</a></li><li><a href="parent-monthly.html">월별 통계</a></li></ul></li>' +
      '<li class="list list04"><a href="notice.html">커뮤니티</a><ul class="sub_ul4">' +
      '<li><a href="notice.html">공지사항</a></li><li><a href="review.html">수강후기</a></li><li><a href="inquiry.html">이용문의</a></li><li><a href="free.html">자유게시판</a></li></ul></li>' +
      '<li class="list list05"><a href="#">SNS</a><ul class="sub_ul5">' +
      '<li><a href="https://www.youtube.com/@math_chang2" target="_blank" rel="noopener noreferrer">유튜브 바로가기</a></li>' +
      '<li><a href="https://www.instagram.com/math_chang2?utm_source=ig_web_button_share_sheet&amp;stkn=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">인스타 바로가기</a></li></ul></li>' +
      "</ul>" +
      '<div class="hd_auth"><a href="login.html" class="hd_auth_link">로그인</a><a href="register.html" class="hd_auth_cta">회원가입</a></div>' +
      "</div></div>" +
      '<div id="topmenuM">' +
      '<h1 id="m_logo"><a href="index.html"><img src="img/common/logo_white.png" alt="이창현수학" /></a></h1>' +
      '<div class="m_user_links"><a href="login.html">로그인</a><a href="register.html">회원가입</a></div>' +
      '<button type="button" id="m_navBtn" aria-label="메뉴 열기" aria-expanded="false" aria-controls="navWrap"><span></span><span></span><span></span></button>' +
      '<div id="navWrap" aria-hidden="true"><div class="inner" role="dialog" aria-modal="true" aria-label="전체 메뉴">' +
      '<div class="m_nav_head"><div class="m_nav_brand"><strong>이창현수학</strong><span>학습관리 메뉴</span></div></div>' +
      '<div class="m_nav_scroll"><div class="m_nav_auth"><a class="m_nav_auth_login" href="login.html">로그인</a><a class="m_nav_auth_join" href="register.html">회원가입</a></div>' +
      '<ul class="m_lnb">' +
      '<li><button class="m_bmenu" type="button" aria-expanded="false">내강의실</button><ul class="m_smenu"><li><a href="preview.html">맛보기강좌</a></li><li><a href="my-courses.html">내강좌</a></li><li><a href="qa-video.html">개별질문영상</a></li></ul></li>' +
      '<li><button class="m_bmenu" type="button" aria-expanded="false">내교실</button><ul class="m_smenu"><li><a href="student-progress.html">수업 현황</a></li><li><a href="student-test.html">테스트 현황</a></li><li><a href="student-monthly.html">월별 통계</a></li><li><a href="student-online.html">온라인 강의실</a></li></ul></li>' +
      '<li><button class="m_bmenu" type="button" aria-expanded="false">학부모교실</button><ul class="m_smenu"><li><a href="parent-progress.html">수업 현황</a></li><li><a href="parent-test.html">테스트 현황</a></li><li><a href="parent-monthly.html">월별 통계</a></li></ul></li>' +
      '<li><button class="m_bmenu" type="button" aria-expanded="false">커뮤니티</button><ul class="m_smenu"><li><a href="notice.html">공지사항</a></li><li><a href="review.html">수강후기</a></li><li><a href="inquiry.html">이용문의</a></li><li><a href="free.html">자유게시판</a></li></ul></li>' +
      '<li><button class="m_bmenu" type="button" aria-expanded="false">SNS</button><ul class="m_smenu"><li><a href="https://www.youtube.com/@math_chang2" target="_blank" rel="noopener noreferrer">유튜브 바로가기</a></li><li><a href="https://www.instagram.com/math_chang2?utm_source=ig_web_button_share_sheet&amp;stkn=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">인스타 바로가기</a></li></ul></li>' +
      "</ul></div>" +
      '<div class="m_nav_foot"><p class="mo_hd_copy">ⓒ 이창현수학</p></div>' +
      "</div></div></div></div></div>"
    );
  }

  function footerHtml() {
    return (
      '<div id="sh_ft_btns"><div class="btns"><a class="tel" href="tel:010-9903-7949"><i class="fa fa-phone"></i>010-9903-7949</a></div></div>' +
      '<a id="fix_tel" href="tel:010-9903-7949" class=""><i class="fa fa-phone"></i></a>' +
      '<div id="sh_ft"><div id="sh_ft_wrapper"><p class="ft_logo"><img src="img/common/logo_white.png" alt="이창현수학"></p>' +
      '<p class="ft_copy">Copyright ⓒ <strong>이창현수학</strong> All rights reserved.</p>' +
      '<p class="ft_tel"><a href="tel:010-9903-7949">010-9903-7949</a></p></div></div>'
    );
  }

  function bannerHtml(meta) {
    return (
      '<div id="sub_main_banner"><div id="sh_content_tit_wrap"><div id="sh_content_tit">' +
      "<h3>" + meta.title + "</h3>" +
      '<span><i class="fa fa-home" aria-hidden="true"></i> <i class="fa fa-angle-right arr" aria-hidden="true"></i> ' +
      meta.parent + ' <i class="fa fa-angle-right arr" aria-hidden="true"></i> ' + meta.title +
      "</span></div></div></div>"
    );
  }

  function snbHtml(meta) {
    var items = SNB[meta.section] || [];
    var lis = items.map(function (item) {
      var cls = item.key === meta.active ? "l_menu_ON" : "l_menu_OFF";
      return '<li class="' + cls + '"><a href="' + item.href + '">' + item.label + "</a></li>";
    }).join("");
    return (
      '<div id="sh_aside"><div id="sh_aside_wrapper"><div id="aside_wrap">' +
      '<a href="index.html" class="home"><i class="fa fa-home" aria-hidden="true"></i></a>' +
      '<ul id="l_menu">' + lis + "</ul></div></div></div>"
    );
  }

  function siteBgUrl(value) {
    if (!value || value === "none") return "";
    return value.replace(/url\(\s*(['"]?)(?!blob:|data:|https?:|\/)([^'")]+)\1\s*\)/gi, function (_, _q, path) {
      return 'url("/site/' + String(path).replace(/^\.?\//, "") + '")';
    });
  }

  var wrap = document.getElementById("sh_wrapper");
  if (wrap) {
    var existingBg = wrap.style.backgroundImage;
    var existingVar = wrap.style.getPropertyValue("--mc-sub-banner-bg");
    var resolved = siteBgUrl(existingBg) || siteBgUrl(existingVar);
    if (resolved) wrap.style.setProperty("--mc-sub-banner-bg", resolved);
    wrap.style.backgroundImage = "none";
    wrap.style.backgroundRepeat = "";
    wrap.style.backgroundPosition = "";
    wrap.style.backgroundPositionX = "";
  }

  var key = document.body.getAttribute("data-page") || "";
  var meta = PAGES[key];
  if (!meta) return;

  var headerSlot = document.getElementById("mc-inject-header");
  var footerSlot = document.getElementById("mc-inject-footer");
  var bannerSlot = document.getElementById("mc-inject-banner");
  var snbSlot = document.getElementById("mc-inject-snb");
  if (headerSlot) headerSlot.outerHTML = headerHtml();
  if (footerSlot) footerSlot.outerHTML = footerHtml();
  if (meta.layout !== "auth") {
    if (bannerSlot) bannerSlot.outerHTML = bannerHtml(meta);
    if (snbSlot) snbSlot.outerHTML = snbHtml(meta);
    if (window.jQuery) {
      jQuery(function () {
        jQuery("#sh_content_tit_wrap").delay(200).animate({ marginTop: "0", opacity: "1" }, 800);
        jQuery(window).on("scroll", function () {
          if (jQuery(window).scrollTop() > 100) jQuery("#fix_tel").addClass("active");
          else jQuery("#fix_tel").removeClass("active");
        });
      });
    }
  } else {
    if (bannerSlot) bannerSlot.remove();
    if (snbSlot) snbSlot.remove();
  }
})();
