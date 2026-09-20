$(document).ready(function () {
    if ($("#include01_wrapper .swiper-container").length) {
        new Swiper("#include01_wrapper .swiper-container", {
            loop: true,
            speed: 500,
            effect: "fade",
            preventClicks: false,
            preventClicksPropagation: false,
            pagination: {
                el: "#include01_wrapper .pager",
                clickable: true,
            },
            autoplay: {
                delay: 3200,
                disableOnInteraction: false,
            },
        });
    }

    function escAttr(str) {
        return String(str == null ? "" : str)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function renderPreviewYoutubeSlots(list) {
        var $slots = $("#include03_wrapper .box01 .video[data-preview-slot]");
        if (!$slots.length) {
            return;
        }
        var fallbackThumb = mcThemeUrl + "/img/main/inc03/video.png";
        var previewPage = mcThemeUrl + "/../../bbs/mc_preview.php";
        var items = Array.isArray(list) ? list.slice(0, 2) : [];

        $slots.each(function () {
            var idx = parseInt($(this).attr("data-preview-slot"), 10) || 0;
            var item = items[idx];
            var href;
            var thumb;
            var title;
            var external = false;

            if (item) {
                href = item.url || previewPage;
                thumb = item.thumb || fallbackThumb;
                title = item.title || "";
                external = !!(item.url && /^https?:\/\//i.test(item.url));
            } else {
                href = previewPage;
                thumb = fallbackThumb;
                title = idx === 0 ? "등록된 영상이 없습니다" : "더 많은 맛보기강좌 보기";
            }

            var linkAttrs = 'href="' + escAttr(href) + '"';
            if (external) {
                linkAttrs += ' target="_blank" rel="noopener noreferrer"';
            }

            $(this).html(
                "<a class=\"mc_pv_link\" " +
                    linkAttrs +
                    ">" +
                    '<span class="mc_pv_media">' +
                    '<img src="' +
                    escAttr(thumb) +
                    '" alt="' +
                    escAttr(title || "맛보기강좌") +
                    '">' +
                    '<span class="mc_pv_play" aria-hidden="true"></span>' +
                    "</span>" +
                    '<span class="mc_pv_meta">' +
                    '<span class="mc_pv_label">맛보기</span>' +
                    '<span class="mc_pv_name">' +
                    escAttr(title) +
                    "</span>" +
                    "</span>" +
                    "</a>"
            );
        });

        if (typeof AOS !== "undefined" && typeof AOS.refresh === "function") {
            AOS.refresh();
        }
    }

    if (typeof mcPreviewYoutubeList !== "undefined") {
        renderPreviewYoutubeSlots(mcPreviewYoutubeList);
    }

    if ($("#include03_wrapper .section02 .swiper-container").length) {
        var reviewSlideCount = $("#include03_wrapper .section02 .swiper-slide").length;
        new Swiper("#include03_wrapper .section02 .swiper-container", {
            loop: reviewSlideCount > 1,
            speed: 650,
            slidesPerView: 1,
            spaceBetween: 0,
            allowTouchMove: true,
            navigation: {
                nextEl: "#include03_wrapper .section02 .mc_rv_next",
                prevEl: "#include03_wrapper .section02 .mc_rv_prev",
            },
            pagination: {
                el: "#include03_wrapper .section02 .pager",
                clickable: true,
            },
        });
    }

    /* STEP 상세 모달 (PC / 모바일) */
    (function () {
        var $modal = $("#mc_step_modal");
        if (!$modal.length) {
            return;
        }
        var $img = $("#mc_step_modal_img");
        var $badge = $("#mc_step_modal_badge");
        var $title = $("#mc_step_modal_title");
        var $desc = $("#mc_step_modal_desc");
        var lastFocus = null;

        function openStepModal($btn) {
            lastFocus = $btn && $btn.length ? $btn[0] : document.activeElement;
            $badge.text("STEP " + ($btn.attr("data-step-num") || ""));
            $title.text($btn.attr("data-step-title") || "");
            $desc.text($btn.attr("data-step-desc") || "");
            $img
                .attr("src", $btn.attr("data-step-img") || "")
                .attr("alt", $btn.attr("data-step-title") || "")
                .css({
                    "object-position": $btn.attr("data-step-pos") || "50% 22%",
                    "transform": "scale(" + ($btn.attr("data-step-zoom") || "1") + ")",
                    "transform-origin": $btn.attr("data-step-pos") || "50% 22%",
                    "filter": "brightness(" + ($btn.attr("data-step-bright") || "1") + ")",
                });
            $modal.removeAttr("hidden").attr("aria-hidden", "false");
            $("body").addClass("mc_step_modal_open");
            $modal.find(".mc_step_modal_close").trigger("focus");
        }

        function closeStepModal() {
            if ($modal.is("[hidden]")) {
                return;
            }
            $modal.attr("hidden", true).attr("aria-hidden", "true");
            $("body").removeClass("mc_step_modal_open");
            if (lastFocus && typeof lastFocus.focus === "function") {
                lastFocus.focus();
            }
        }

        $(document).on("click", "#include01_wrapper .mc_step_card[data-step-open]", function (e) {
            e.preventDefault();
            openStepModal($(this));
        });

        $(document).on("keydown", "#include01_wrapper .mc_step_card[data-step-open]", function (e) {
            if (e.key === "Enter" || e.key === " " || e.keyCode === 13 || e.keyCode === 32) {
                e.preventDefault();
                openStepModal($(this));
            }
        });

        $(document).on("click", "#mc_step_modal [data-step-close]", function () {
            closeStepModal();
        });

        $(document).on("keydown", function (e) {
            if (e.key === "Escape" || e.keyCode === 27) {
                closeStepModal();
            }
        });
    })();
});
