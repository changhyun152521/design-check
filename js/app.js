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

  var uploadView = document.getElementById("uploadView");
  var previewView = document.getElementById("previewView");
  var stage = document.getElementById("previewStage");
  var iframe = document.getElementById("previewFrame");
  var modeLabel = document.getElementById("modeLabel");
  var intro = document.getElementById("intro");
  var introDone = false;

  function finishIntro() {
    if (introDone) return;
    introDone = true;
    document.body.classList.remove("intro-on");
    document.body.classList.add("is-entered");
    if (!intro) return;
    intro.classList.add("is-out");
    window.setTimeout(function () {
      intro.hidden = true;
    }, 720);
  }

  function skipIntroNow() {
    introDone = true;
    document.body.classList.remove("intro-on");
    document.body.classList.add("is-entered");
    if (intro) intro.hidden = true;
  }

  (function startIntro() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!intro || reduce) {
      skipIntroNow();
      return;
    }
    var timer = window.setTimeout(finishIntro, 2480);
    var armed = false;
    window.setTimeout(function () { armed = true; }, 380);
    function onSkip() {
      if (!armed) return;
      window.clearTimeout(timer);
      finishIntro();
    }
    intro.addEventListener("click", onSkip);
    var skipBtn = document.getElementById("introSkip");
    if (skipBtn) {
      skipBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        window.clearTimeout(timer);
        finishIntro();
      });
    }
    document.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        document.removeEventListener("keydown", onKey);
        onSkip();
      }
    });
  })();

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
    previewOpen = true;
    uploadView.hidden = true;
    previewView.hidden = false;
    setDevice("pc", false);
    iframe.src = "/site/index.html?t=" + Date.now();
    requestAnimationFrame(fitPcScale);
  }

  function closePreview() {
    previewOpen = false;
    previewView.hidden = true;
    uploadView.hidden = false;
    iframe.removeAttribute("src");
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
