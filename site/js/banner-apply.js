(function () {
  var STYLE_ID = "mc-banner-overrides";

  function cssUrl(src) {
    return "url(" + JSON.stringify(src) + ")";
  }

  function applyBanners(banners) {
    if (!banners) return;
    var parts = [];

    if (banners.top) {
      var topUrl = cssUrl(banners.top);
      parts.push("#sh_wrapper{background-image:" + topUrl + ";background-repeat:no-repeat;background-position-x:center;--mc-main-banner-bg:" + topUrl + ";}");
      parts.push("@media (max-width:1024px){#main_banner{background:" + topUrl + " no-repeat center / cover !important}}");
    }
    if (banners.system) {
      parts.push("#include02_wrapper{background-image:" + cssUrl(banners.system) + " !important;}");
    }
    if (banners.slide1) {
      parts.push("#include01_wrapper .swiper-slide.bg01{background-image:" + cssUrl(banners.slide1) + " !important;background-repeat:no-repeat;background-position:center;background-size:cover;}");
    }
    if (banners.slide2) {
      parts.push("#include01_wrapper .swiper-slide.bg02{background-image:" + cssUrl(banners.slide2) + " !important;background-repeat:no-repeat;background-position:center;background-size:cover;}");
    }

    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = parts.join("\n");

    if (banners.top) {
      var wrap = document.getElementById("sh_wrapper");
      if (wrap) {
        wrap.style.backgroundImage = cssUrl(banners.top);
        wrap.style.setProperty("--mc-main-banner-bg", cssUrl(banners.top));
      }
    }
  }

  window.mcApplyBanners = applyBanners;

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.type !== "MC_APPLY_BANNERS") return;
    applyBanners(data.banners || {});
  });

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    var href = (a.getAttribute("href") || "").trim();
    if (a.target === "_blank") return;
    if (/^(tel:|mailto:|https?:)/i.test(href)) return;
    if (href === "" || href === "#" || href.indexOf("#bookmark") === 0) {
      e.preventDefault();
    }
  });

  function notifyReady() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "MC_SITE_READY" }, "*");
    }
  }

  if (document.readyState === "complete") {
    notifyReady();
  } else {
    window.addEventListener("load", notifyReady);
  }
})();
