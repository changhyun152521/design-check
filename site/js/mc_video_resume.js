/**
 * 이어보기 모달 — 내강좌 / 복습영상 공용
 * McVideoResume.ask({ title, watchedSec, percent }, function (startSec) {})
 */
(function (window, $) {
    'use strict';
    if (!$) return;

    var MIN_RESUME_SEC = 10;
    var DONE_PERCENT = 95;
    var $modal = null;
    var pendingCb = null;

    function formatKoreanTime(sec) {
        sec = Math.max(0, Math.floor(sec || 0));
        var h = Math.floor(sec / 3600);
        var m = Math.floor((sec % 3600) / 60);
        var s = sec % 60;
        if (h > 0) {
            return h + '시간 ' + m + '분 ' + s + '초';
        }
        if (m > 0) {
            return m + '분 ' + s + '초';
        }
        return s + '초';
    }

    function ensureModal() {
        if ($modal && $modal.length) return $modal;
        if (!$('#mc_vr_modal').length) {
            $('body').append(
                '<div id="mc_vr_modal" aria-hidden="true">' +
                    '<div class="mc_vr_panel" role="dialog" aria-modal="true" aria-labelledby="mc_vr_title">' +
                        '<button type="button" class="mc_vr_close" aria-label="닫기">&times;</button>' +
                        '<p class="mc_vr_eyebrow">RESUME</p>' +
                        '<h3 class="mc_vr_title" id="mc_vr_title"></h3>' +
                        '<p class="mc_vr_desc">이전에 시청한 기록이 있습니다.<br>이어서 시청할까요?</p>' +
                        '<span class="mc_vr_time" id="mc_vr_time"></span>' +
                        '<div class="mc_vr_actions">' +
                            '<button type="button" class="mc_vr_btn" data-vr-action="restart">처음부터</button>' +
                            '<button type="button" class="mc_vr_btn is-primary" data-vr-action="resume">이어보기</button>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );
        }
        $modal = $('#mc_vr_modal');

        $modal.on('click', '[data-vr-action]', function () {
            var action = $(this).attr('data-vr-action');
            var start = action === 'resume' ? ($modal.data('watched') || 0) : 0;
            closeModal();
            if (typeof pendingCb === 'function') {
                var cb = pendingCb;
                pendingCb = null;
                cb(start);
            }
        });
        $modal.on('click', '.mc_vr_close', function () {
            closeModal();
            pendingCb = null;
        });
        $modal.on('click', function (e) {
            if (e.target === this) {
                closeModal();
                pendingCb = null;
            }
        });
        $(document).on('keyup.mcVr', function (e) {
            if (e.key === 'Escape' && $modal.hasClass('is-open')) {
                closeModal();
                pendingCb = null;
            }
        });
        return $modal;
    }

    function openModal(opts) {
        var $m = ensureModal();
        var watched = Math.max(0, parseInt(opts.watchedSec, 10) || 0);
        $m.data('watched', watched);
        $m.find('#mc_vr_title').text(opts.title || '강의 영상');
        $m.find('#mc_vr_time').text(formatKoreanTime(watched) + ' 지점');
        $m.addClass('is-open').attr('aria-hidden', 'false');
        $('body').addClass('mc-video-open').css('overflow', 'hidden');
    }

    function closeModal() {
        if (!$modal || !$modal.length) return;
        $modal.removeClass('is-open').attr('aria-hidden', 'true');
        // 라이트박스가 열려 있지 않을 때만 overflow 복구
        if (!$('.is-open[id$="_lightbox"]').length && !$('[id$="_lightbox"].is-open').length) {
            var stillOpen = $('#mc_cv_lightbox.is-open, #mc_pg_lightbox.is-open, #mc_qa_lightbox.is-open').length > 0;
            if (!stillOpen) {
                $('body').removeClass('mc-video-open').css('overflow', '');
            }
        }
    }

    function shouldAsk(watchedSec, percent) {
        watchedSec = parseInt(watchedSec, 10) || 0;
        percent = parseInt(percent, 10) || 0;
        if (watchedSec < MIN_RESUME_SEC) return false;
        if (percent >= DONE_PERCENT) return false;
        return true;
    }

    window.McVideoResume = {
        formatTime: formatKoreanTime,
        shouldAsk: shouldAsk,
        ask: function (opts, cb) {
            opts = opts || {};
            var watched = parseInt(opts.watchedSec, 10) || 0;
            var percent = parseInt(opts.percent, 10) || 0;
            if (!shouldAsk(watched, percent)) {
                if (typeof cb === 'function') cb(0);
                return;
            }
            pendingCb = cb;
            openModal(opts);
        },
        close: closeModal
    };
})(window, window.jQuery);
