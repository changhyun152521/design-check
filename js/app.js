(function () {
  var banners = {
    top: "",
    system: "",
    slide1: "",
    slide2: ""
  };
  var objectUrls = [];
  var device = "pc";
  var previewOpen = false;
  var useUploaded = true;
  var currentView = "intro";

  var uploadView = document.getElementById("uploadView");
  var previewView = document.getElementById("previewView");
  var historyView = document.getElementById("historyView");
  var homeView = document.getElementById("homeView");
  var stage = document.getElementById("previewStage");
  var iframe = document.getElementById("previewFrame");
  var modeLabel = document.getElementById("modeLabel");
  var intro = document.getElementById("intro");
  var introDone = false;
  var homeStarted = false;

  var views = {
    history: historyView,
    home: homeView,
    upload: uploadView,
    preview: previewView
  };

  function hideIntro() {
    if (introDone) return;
    introDone = true;
    document.body.classList.remove("intro-on");
    if (!intro) return;
    intro.classList.add("is-out");
    window.setTimeout(function () {
      intro.hidden = true;
    }, 720);
  }

  function revealIntroCta() {
    if (intro) intro.classList.add("is-ready");
  }

  function showView(name) {
    currentView = name;
    previewOpen = name === "preview";
    Object.keys(views).forEach(function (key) {
      if (views[key]) views[key].hidden = key !== name;
    });
    document.body.classList.toggle("is-entered", name === "upload");
    document.body.classList.toggle("is-home", name === "home");
    document.body.classList.toggle("is-history", name === "history");
    if (name === "home") {
      startHome();
      homeView.classList.add("is-shown");
    }
    window.scrollTo(0, 0);
    if (name === "home") {
      var headEl = document.getElementById("phomeHead");
      if (headEl) headEl.classList.remove("is-solid", "is-open");
      window.setTimeout(function () { setupReveal(homeView); }, 50);
    }
    if (name === "history") {
      historyView.classList.add("is-shown");
      window.setTimeout(function () { setupReveal(historyView); }, 50);
    }
  }

  function goHistory() {
    hideIntro();
    showView("history");
  }

  function goHome() {
    hideIntro();
    showView("home");
  }

  var transit = document.getElementById("transit");
  var transitTimer = null;
  var transitRunning = false;
  var TRANSIT_MS = 10000;

  function goUpload() {
    hideIntro();
    playTransitThenUpload();
  }

  function preloadTransit() {
    [
      "img/home/visual-1.jpg",
      "img/home/visual-2.jpg",
      "img/home/prog-1.jpg",
      "img/home/visual-3.jpg",
      "img/home/banner.jpg",
      "img/intro-still.jpg"
    ].forEach(function (src) {
      var im = new Image();
      im.src = src;
    });
  }

  function playTransitThenUpload() {
    if (transitRunning) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !transit) {
      showView("upload");
      return;
    }
    transitRunning = true;
    document.body.classList.add("is-transit");
    if (intro) intro.hidden = true;
    transit.hidden = false;
    transit.classList.remove("is-on", "is-out");
    void transit.offsetWidth;
    transit.classList.add("is-on");
    window.clearTimeout(transitTimer);
    transitTimer = window.setTimeout(finishTransit, TRANSIT_MS);
  }

  function finishTransit() {
    window.clearTimeout(transitTimer);
    transitTimer = null;
    if (!transit) {
      transitRunning = false;
      showView("upload");
      return;
    }
    transit.classList.add("is-out");
    window.setTimeout(function () {
      transit.hidden = true;
      transit.classList.remove("is-on", "is-out");
      document.body.classList.remove("is-transit");
      transitRunning = false;
      showView("upload");
    }, 400);
  }

  (function startIntro() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!intro) {
      goHistory();
      return;
    }
    if (reduce) revealIntroCta();
    else window.setTimeout(revealIntroCta, 2200);

    var skipBtn = document.getElementById("introSkip");
    if (skipBtn) {
      skipBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        revealIntroCta();
      });
    }
    var toHistory = document.getElementById("btnToHistory");
    if (toHistory) toHistory.addEventListener("click", goHistory);
  })();

  var toHome = document.getElementById("btnToHome");
  if (toHome) toHome.addEventListener("click", goHome);

  document.querySelectorAll("[data-go-upload]").forEach(function (btn) {
    btn.addEventListener("click", goUpload);
  });

  function setupReveal(root) {
    if (!root || root.getAttribute("data-reveal-ready") === "1") return;
    root.setAttribute("data-reveal-ready", "1");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var nodes = [];
    var selectors = [
      "#history1008 .tit",
      "#history1008 .cont > div",
      ".hx-cta",
      ".phome-sec-tit",
      ".phome-sec-lead",
      ".phome-card",
      ".phome-banner-inner",
      ".phome-prog-left",
      ".phome-prog-right",
      ".phome-news-top",
      ".phome-news-item",
      ".phome-foot",
      ".phome-final"
    ];
    selectors.forEach(function (sel) {
      root.querySelectorAll(sel).forEach(function (el) {
        el.classList.add("reveal");
        nodes.push(el);
      });
    });
    root.querySelectorAll("#history1008 .cont > div").forEach(function (el, i) {
      el.style.transitionDelay = (0.05 * i) + "s";
    });
    root.querySelectorAll(".phome-card").forEach(function (el, i) {
      el.style.transitionDelay = (0.08 * i) + "s";
    });
    root.querySelectorAll(".phome-news-item").forEach(function (el, i) {
      el.style.transitionDelay = (0.07 * i) + "s";
    });
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach(function (el) { io.observe(el); });
    window.requestAnimationFrame(function () {
      nodes.forEach(function (el) {
        var box = el.getBoundingClientRect();
        if (box.top < window.innerHeight * 0.9 && box.bottom > 0) {
          el.classList.add("is-in");
          io.unobserve(el);
        }
      });
    });
  }

  function startHome() {
    if (homeStarted) return;
    homeStarted = true;
    preloadTransit();

    var slides = document.querySelectorAll(".phome-slide");
    var pagerBtns = document.querySelectorAll("#phomePager button");
    var visualIndex = 0;
    var visualTimer = null;
    var visualMs = 5000;

    function setVisual(i) {
      visualIndex = (i + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-on", idx === visualIndex);
      });
      pagerBtns.forEach(function (btn, idx) {
        btn.classList.toggle("is-on", idx === visualIndex);
      });
    }
    function tickVisual() {
      setVisual(visualIndex + 1);
    }
    function startVisual() {
      window.clearInterval(visualTimer);
      visualTimer = window.setInterval(tickVisual, visualMs);
    }
    pagerBtns.forEach(function (btn, idx) {
      btn.addEventListener("click", function () {
        setVisual(idx);
        startVisual();
      });
    });
    startVisual();

    var progTexts = [
      {
        sub: "정기공연 〈춘향가〉",
        desc: "국립극장 무대에 오르는 임규태 판소리연희단 정기공연입니다. 창과 북이 한 호흡으로 만나는 춘향가의 본령을 가까이에서 확인합니다."
      },
      {
        sub: "해외 초청 공연",
        desc: "뉴욕 링컨센터, 파리 유네스코, 도쿄 국립극장. 초청받은 무대에서 우리 판소리가 세계 관객과 마주한 현장을 전합니다."
      },
      {
        sub: "전주세계소리축제",
        desc: "국내 대표 소리 축제의 개막 무대에 선 연희단입니다. 창과 고수가 만드는 호흡을 축제의 한가운데에서 이어 갑니다."
      }
    ];
    var track = document.getElementById("progTrack");
    var figures = track ? track.querySelectorAll("figure") : [];
    var progIndex = 0;
    var progSub = document.getElementById("progSub");
    var progDesc = document.getElementById("progDesc");
    var progCur = document.getElementById("progCur");
    var progTotal = document.getElementById("progTotal");
    if (progTotal) progTotal.textContent = ("0" + figures.length).slice(-2);

    function pad(n) {
      return ("0" + (n + 1)).slice(-2);
    }
    function setProg(i) {
      if (!figures.length) return;
      progIndex = (i + figures.length) % figures.length;
      var w = figures[0].getBoundingClientRect().width;
      var gap = window.innerWidth <= 992 ? 0 : 40;
      track.style.transform = "translateX(" + (-progIndex * (w + gap)) + "px)";
      if (progSub) progSub.textContent = progTexts[progIndex].sub;
      if (progDesc) progDesc.textContent = progTexts[progIndex].desc;
      if (progCur) progCur.textContent = pad(progIndex);
    }
    var prev = document.getElementById("progPrev");
    var next = document.getElementById("progNext");
    if (prev) prev.addEventListener("click", function () { setProg(progIndex - 1); });
    if (next) next.addEventListener("click", function () { setProg(progIndex + 1); });
    window.addEventListener("resize", function () { setProg(progIndex); });
    setProg(0);

    var head = document.getElementById("phomeHead");
    var burger = document.getElementById("phomeBurger");
    function onHomeScroll() {
      if (!head) return;
      head.classList.toggle("is-solid", homeView.scrollTop > 40 || window.scrollY > 40);
    }
    window.addEventListener("scroll", onHomeScroll, { passive: true });
    if (burger && head) {
      burger.addEventListener("click", function () {
        head.classList.toggle("is-open");
      });
    }
    document.querySelectorAll(".phome a[href^='#'], [data-scroll]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        var target = el.getAttribute("data-scroll") || el.getAttribute("href");
        if (!target || target === "#") return;
        var node = document.querySelector(target);
        if (!node) return;
        e.preventDefault();
        node.scrollIntoView({ behavior: "smooth", block: "start" });
        if (head) head.classList.remove("is-open");
      });
    });

    var hint = document.getElementById("phomeHint");
    var finalEl = document.getElementById("homeFinal");
    if (hint && finalEl && "IntersectionObserver" in window) {
      var hintIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          hint.classList.toggle("is-hide", entry.isIntersecting);
        });
      }, { threshold: 0.45 });
      hintIo.observe(finalEl);
    }
  }

  function revokeAll() {
    objectUrls.forEach(function (u) {
      try { URL.revokeObjectURL(u); } catch (e) {}
    });
    objectUrls = [];
  }

  function fitPcScale() {
    if (device !== "pc" || !previewOpen) {
      stage.style.removeProperty("--pc-scale");
      return;
    }
    var w = stage.clientWidth || 1920;
    var scale = Math.min(1, w / 1920);
    stage.style.setProperty("--pc-scale", String(scale));
  }

  function setDevice(next, reload) {
    var nextDevice = next === "mobile" ? "mobile" : "pc";
    var changed = device !== nextDevice;
    device = nextDevice;
    document.querySelectorAll("[data-device]").forEach(function (btn) {
      btn.classList.toggle("is-on", btn.getAttribute("data-device") === device);
    });
    stage.classList.toggle("is-pc", device === "pc");
    stage.classList.toggle("is-mobile", device === "mobile");
    if (modeLabel) {
      modeLabel.textContent = device === "mobile" ? "모바일" : "PC";
    }
    fitPcScale();
    if (reload !== false && previewOpen && changed) {
      iframe.src = "/site/index.html?t=" + Date.now();
    }
  }

  function bindDrop(inputId, key) {
    var input = document.getElementById(inputId);
    var drop = input.closest(".drop");
    var img = drop.querySelector("img.preview");
    var fallback = drop.querySelector("img.preview-default");
    var shot = drop.closest(".shot");
    var nameEl = drop.parentElement.querySelector("[data-filename]");
    var clearBtn = drop.parentElement.querySelector("[data-clear]");
    var dragDepth = 0;

    function markFile(on) {
      drop.classList.toggle("has-file", on);
      if (shot) shot.classList.toggle("has-file", on);
    }

    function setRatio(image) {
      if (!image || !image.naturalWidth || !image.naturalHeight) return;
      drop.style.setProperty("--ratio", image.naturalWidth + " / " + image.naturalHeight);
    }
    function resetRatio() {
      var ratio = drop.getAttribute("data-ratio");
      if (ratio) drop.style.setProperty("--ratio", ratio);
    }
    if (fallback) {
      if (fallback.complete) setRatio(fallback);
      else fallback.addEventListener("load", function () { setRatio(fallback); });
    }

    function applyFile(file) {
      if (!file || !file.type || file.type.indexOf("image/") !== 0) return;
      var url = URL.createObjectURL(file);
      objectUrls.push(url);
      banners[key] = url;
      img.onload = function () { setRatio(img); };
      img.src = url;
      markFile(true);
      if (nameEl) nameEl.textContent = file.name;
    }

    input.addEventListener("change", function () {
      if (input.files && input.files[0]) applyFile(input.files[0]);
    });

    drop.addEventListener("dragenter", function (e) {
      e.preventDefault();
      dragDepth += 1;
      drop.classList.add("is-drag");
    });
    drop.addEventListener("dragover", function (e) {
      e.preventDefault();
    });
    drop.addEventListener("dragleave", function () {
      dragDepth = Math.max(0, dragDepth - 1);
      if (!dragDepth) drop.classList.remove("is-drag");
    });
    drop.addEventListener("drop", function (e) {
      e.preventDefault();
      dragDepth = 0;
      drop.classList.remove("is-drag");
      var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      applyFile(file);
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        banners[key] = "";
        input.value = "";
        img.removeAttribute("src");
        markFile(false);
        resetRatio();
        if (fallback) setRatio(fallback);
        if (nameEl) nameEl.textContent = "";
      });
    }
  }

  function sendBanners() {
    var win = iframe.contentWindow;
    if (!win) return;
    win.postMessage({
      type: "MC_APPLY_BANNERS",
      banners: useUploaded ? {
        top: banners.top,
        system: banners.system,
        slide1: banners.slide1,
        slide2: banners.slide2
      } : { top: "", system: "", slide1: "", slide2: "" }
    }, "*");
  }

  function openPreview() {
    showView("preview");
    setDevice("pc", false);
    iframe.src = "/site/index.html?t=" + Date.now();
    requestAnimationFrame(fitPcScale);
  }

  function closePreview() {
    iframe.removeAttribute("src");
    showView("upload");
  }

  bindDrop("fileTop", "top");
  bindDrop("fileSystem", "system");
  bindDrop("fileSlide1", "slide1");
  bindDrop("fileSlide2", "slide2");

  document.querySelectorAll("[data-device]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setDevice(btn.getAttribute("data-device"));
    });
  });

  document.getElementById("btnPreview").addEventListener("click", function () {
    useUploaded = true;
    openPreview();
  });
  document.getElementById("btnPreviewDefault").addEventListener("click", function () {
    useUploaded = false;
    openPreview();
  });
  document.getElementById("btnBack").addEventListener("click", closePreview);

  window.addEventListener("message", function (event) {
    if (!previewOpen) return;
    if (event.data && event.data.type === "MC_SITE_READY") {
      sendBanners();
    }
  });

  window.addEventListener("resize", fitPcScale);
  setDevice("pc", false);
})();
