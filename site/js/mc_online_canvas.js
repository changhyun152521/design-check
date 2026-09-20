/**
 * 온라인TEST — GoodNotes형 필기 캔버스
 * MC_ONLINE_BOOT 정의 이후에 로드되어야 함
 */
(function () {
  'use strict';

  function ensureDialog() {
    var el = document.getElementById('mc_on_dialog');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'mc_on_dialog';
    el.innerHTML =
      '<div class="mc_on_dlg_panel" role="dialog" aria-modal="true">' +
      '<p class="mc_on_dlg_msg"></p>' +
      '<div class="mc_on_dlg_actions"></div>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function showDialog(message, buttons) {
    return new Promise(function (resolve) {
      var el = ensureDialog();
      var msg = el.querySelector('.mc_on_dlg_msg');
      var acts = el.querySelector('.mc_on_dlg_actions');
      msg.textContent = message || '';
      acts.innerHTML = '';
      (buttons || [{ label: '확인', value: true, primary: true }]).forEach(function (b) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mc_on_dlg_btn' + (b.primary ? ' is-primary' : '');
        btn.textContent = b.label;
        btn.addEventListener('click', function () {
          el.classList.remove('is-open');
          resolve(b.value);
        });
        acts.appendChild(btn);
      });
      el.classList.add('is-open');
    });
  }

  function bindAnswerPanel() {
    var workspace = document.getElementById('mc_on_workspace');
    var ansToggle = document.getElementById('mc_on_ans_toggle');
    var panelClose = document.getElementById('mc_on_panel_close');
    var panel = document.getElementById('mc_on_answer_panel');
    if (!workspace || !panel) return;

    var panelHome = panel.parentNode;
    var lbl = ansToggle ? ansToggle.querySelector('.mc_on_panel_btn_lbl') : null;

    function syncToggleUi(on) {
      if (!ansToggle) return;
      ansToggle.classList.toggle('is-primary', on);
      ansToggle.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (lbl) lbl.textContent = on ? '답안 닫기' : '답안 열기';
    }

    function togglePanel(open) {
      var on = typeof open === 'boolean' ? open : !document.body.classList.contains('mc-on-ans-open');
      workspace.classList.toggle('is-panel-open', on);
      document.body.classList.toggle('mc-on-ans-open', on);
      panel.setAttribute('aria-hidden', on ? 'false' : 'true');
      syncToggleUi(on);

      if (on && panel.parentNode !== document.body) {
        document.body.appendChild(panel);
      } else if (!on && panelHome && panel.parentNode !== panelHome) {
        panelHome.appendChild(panel);
      }
    }

    if (ansToggle) {
      ansToggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        togglePanel();
      });
    }
    if (panelClose) {
      panelClose.addEventListener('click', function (e) {
        e.preventDefault();
        togglePanel(false);
      });
    }
    document.addEventListener('click', function (e) {
      if (!document.body.classList.contains('mc-on-ans-open')) return;
      if (panel.contains(e.target) || (ansToggle && ansToggle.contains(e.target))) return;
      if (e.target.closest('#mc_on_submit_btn, #mc_on_dialog, .mc_on_dlg_btn')) return;
      togglePanel(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') togglePanel(false);
    });

    if (window.matchMedia('(min-width: 1024px)').matches) {
      togglePanel(true);
    } else {
      syncToggleUi(false);
    }
  }

  function startCanvas() {
    var boot = window.MC_ONLINE_BOOT;
    if (!boot || !boot.pages) return;

    var pages = boot.pages.slice();
    var pageIndex = 0;
    var tool = 'pan';
    var color = '#1f2430';
    var size = 3;
    var scale = 1;
    var panX = 0;
    var panY = 0;
    var drawing = false;
    var lastPt = null;
    var strokesByPage = {};
    var sharedStrokesByPage = {};
    var undoByPage = {};
    var redoByPage = {};
    var sharedUndoByPage = {};
    var sharedRedoByPage = {};
    var pointerId = null;
    var panning = false;
    var panStart = null;
    var pinch = null;
    var sharedEnabled = !!(boot.sharedEnabled && boot.sharedUrl && boot.shareMb);
    var shareOnlyDraw = !!(boot.kind === 'homework' || boot.isPreview || boot.asAdmin || !boot.canSolve);
    var sharedUpdated = 0;
    var sharedSaveTimer = null;
    var sharedPollTimer = null;
    var sharedSaving = false;
    var localSharedDirty = false;
    var isHomework = boot.kind === 'homework';
    var appleTouch = /iP(ad|hone|od)/.test(navigator.userAgent || '')
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    var stageWrap = document.getElementById('mc_on_stage_wrap');
    var pageEl = document.getElementById('mc_on_page');
    var bg = document.getElementById('mc_on_bg');
    var canvas = document.getElementById('mc_on_ink');
    var ctx = canvas ? canvas.getContext('2d') : null;
    var pageInd = document.getElementById('mc_on_page_ind');
    var overlay = document.getElementById('mc_on_submit_overlay');
    var submitMsg = document.getElementById('mc_on_submit_msg');

    if (!ctx || !stageWrap || !pageEl || !bg) return;

    function ensurePage(i) {
      if (!strokesByPage[i]) strokesByPage[i] = [];
      if (!undoByPage[i]) undoByPage[i] = [];
      if (!redoByPage[i]) redoByPage[i] = [];
      if (!sharedStrokesByPage[i]) sharedStrokesByPage[i] = [];
      if (!sharedUndoByPage[i]) sharedUndoByPage[i] = [];
      if (!sharedRedoByPage[i]) sharedRedoByPage[i] = [];
    }

    function newStrokeId() {
      return 's' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    }

    function personalIdMap() {
      var map = {};
      Object.keys(strokesByPage).forEach(function (k) {
        var list = strokesByPage[k] || [];
        for (var i = 0; i < list.length; i++) {
          if (list[i] && list[i].id) map[list[i].id] = true;
        }
      });
      return map;
    }

    function sharedFingerprint(map) {
      try {
        return JSON.stringify(map || {});
      } catch (e) {
        return '';
      }
    }

    /** 서버/로컬 필기를 {0:[...], 1:[...]} 형태로 통일 */
    function normalizeStrokes(raw) {
      var out = {};
      if (!raw || typeof raw !== 'object') return out;
      if (Array.isArray(raw)) {
        for (var i = 0; i < raw.length; i++) {
          out[i] = Array.isArray(raw[i]) ? raw[i].slice() : [];
        }
        return out;
      }
      Object.keys(raw).forEach(function (k) {
        var idx = parseInt(k, 10);
        if (!isFinite(idx)) return;
        out[idx] = Array.isArray(raw[k]) ? raw[k].slice() : [];
      });
      return out;
    }

    function strokeCount(map) {
      var n = 0;
      if (!map || typeof map !== 'object') return 0;
      Object.keys(map).forEach(function (k) {
        if (Array.isArray(map[k])) n += map[k].length;
      });
      return n;
    }

    function loadDraft() {
      // 제출 이미지에 필기가 이미 들어 있으면(inkBaked) 캔버스는 추가 필기만
      strokesByPage = boot.inkBaked ? {} : normalizeStrokes(boot.initialStrokes);
      if (boot.initialAnswers && typeof boot.initialAnswers === 'object') {
        Object.keys(boot.initialAnswers).forEach(function (q) {
          var el = document.getElementById('mc_ans_' + q);
          if (el) el.value = boot.initialAnswers[q] == null ? '' : String(boot.initialAnswers[q]);
        });
      }
      try {
        var raw = localStorage.getItem(boot.storageKey);
        if (!raw) return;
        var data = JSON.parse(raw);
        // 제출 JPEG은 축소본인데 시험 필기 좌표는 원본 문제 기준 → 다시 올리면 확대·중첩
        if (boot.inkBaked) return;
        if (boot.mode === 'review') {
          // 서버 필기가 없을 때만 로컬 보완 (제출 직후 빈 초안으로 덮어쓰지 않음)
          if (!strokeCount(strokesByPage) && data && data.strokes) {
            strokesByPage = normalizeStrokes(data.strokes);
          }
          return;
        }
        if (data && data.strokes) strokesByPage = normalizeStrokes(data.strokes);
        if (data && data.answers) {
          Object.keys(data.answers).forEach(function (q) {
            var el = document.getElementById('mc_ans_' + q);
            if (el && !el.value) el.value = data.answers[q];
          });
        }
        if (typeof data.pageIndex === 'number') pageIndex = data.pageIndex;
      } catch (e) {}
    }

    function collectAnswers() {
      var out = {};
      var qs = (boot.questions && boot.questions.length) ? boot.questions : [];
      if (qs.length) {
        for (var i = 0; i < qs.length; i++) {
          var qn = String(qs[i].q_no);
          var el = document.getElementById('mc_ans_' + qn);
          out[qn] = el ? String(el.value || '') : '';
        }
      } else {
        var inputs = document.querySelectorAll('.mc_on_ans_input');
        for (var j = 0; j < inputs.length; j++) {
          out[String(inputs[j].getAttribute('data-q'))] = String(inputs[j].value || '');
        }
      }
      // 입력란이 비어 있으면 localStorage 임시저장 값으로 보완
      try {
        var raw = localStorage.getItem(boot.storageKey);
        if (raw) {
          var data = JSON.parse(raw);
          if (data && data.answers) {
            Object.keys(data.answers).forEach(function (q) {
              if (!out[q] || String(out[q]).trim() === '') {
                out[q] = String(data.answers[q] || '');
              }
            });
          }
        }
      } catch (e) {}
      return out;
    }

    function saveDraft() {
      try {
        localStorage.setItem(
          boot.storageKey,
          JSON.stringify({ strokes: strokesByPage, answers: collectAnswers(), pageIndex: pageIndex, t: Date.now() })
        );
      } catch (e) {}
    }

    function applyTransform() {
      pageEl.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + scale + ')';
    }

    function fitPage() {
      var wrapW = stageWrap.clientWidth || 1;
      var wrapH = stageWrap.clientHeight || 1;
      var pw = pageEl.dataset.pw ? parseFloat(pageEl.dataset.pw) : 800;
      var ph = pageEl.dataset.ph ? parseFloat(pageEl.dataset.ph) : 1100;
      var s = Math.min(wrapW / pw, wrapH / ph) * 0.96;
      if (!isFinite(s) || s <= 0) s = 1;
      scale = s;
      panX = (wrapW - pw * scale) / 2;
      panY = (wrapH - ph * scale) / 2;
      applyTransform();
    }

    function redraw() {
      ensurePage(pageIndex);
      var strokes = strokesByPage[pageIndex] || [];
      var shared = sharedStrokesByPage[pageIndex] || [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < strokes.length; i++) drawStroke(strokes[i]);
      var own = personalIdMap();
      for (var j = 0; j < shared.length; j++) {
        var st = shared[j];
        if (st && st.id && own[st.id]) continue;
        drawStroke(st);
      }
      if (canvas._cur) drawStroke(canvas._cur);
    }

    function drawStroke(st) {
      if (!st || !st.pts || st.pts.length < 1) return;
      ctx.save();
      if (st.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = st.color || '#1f2430';
      }
      ctx.lineWidth = st.size || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(st.pts[0].x, st.pts[0].y);
      for (var i = 1; i < st.pts.length; i++) ctx.lineTo(st.pts[i].x, st.pts[i].y);
      if (st.pts.length === 1) ctx.lineTo(st.pts[0].x + 0.01, st.pts[0].y);
      ctx.stroke();
      ctx.restore();
    }

    function localPoint(e) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    }

    function setPage(i) {
      if (i < 0 || i >= pages.length) return;
      pageIndex = i;
      ensurePage(pageIndex);
      var url = pages[pageIndex] || '';
      pageInd.textContent = pageIndex + 1 + ' / ' + pages.length;
      canvas.style.background = 'transparent';

      function useBlank() {
        bg.style.display = 'none';
        bg.removeAttribute('src');
        var w = 800;
        var h = 1100;
        pageEl.dataset.pw = w;
        pageEl.dataset.ph = h;
        pageEl.style.width = w + 'px';
        pageEl.style.height = h + 'px';
        canvas.width = w;
        canvas.height = h;
        canvas.style.background = '#fff';
        fitPage();
        redraw();
      }

      if (url) {
        bg.style.display = 'block';
        bg.onload = function () {
          var w = bg.naturalWidth || 800;
          var h = bg.naturalHeight || 1100;
          pageEl.dataset.pw = w;
          pageEl.dataset.ph = h;
          pageEl.style.width = w + 'px';
          pageEl.style.height = h + 'px';
          canvas.width = w;
          canvas.height = h;
          fitPage();
          redraw();
        };
        bg.onerror = useBlank;
        if (bg.getAttribute('src') === url && bg.complete && bg.naturalWidth) {
          bg.onload();
        } else {
          bg.src = url;
        }
      } else {
        useBlank();
      }
      saveDraft();
    }

    function scheduleSharedSave() {
      if (!sharedEnabled) return;
      localSharedDirty = true;
      if (sharedSaveTimer) clearTimeout(sharedSaveTimer);
      sharedSaveTimer = setTimeout(function () {
        sharedSaveTimer = null;
        saveSharedNow();
      }, 280);
    }

    function saveSharedNow() {
      if (!sharedEnabled || sharedSaving) return;
      sharedSaving = true;
      var fd = new FormData();
      if (isHomework) {
        fd.append('hw_id', String(boot.hwId || boot.examId));
      } else {
        fd.append('exam_id', String(boot.examId));
      }
      fd.append('mb_no', String(boot.shareMb));
      var blob = new Blob([JSON.stringify({ strokes: sharedStrokesByPage })], { type: 'application/json' });
      fd.append('strokes_file', blob, 'shared.json');
      fetch(boot.sharedUrl, { method: 'POST', credentials: 'same-origin', body: fd })
        .then(function (r) { return r.json(); })
        .then(function (json) {
          if (json && json.ok && json.updated) sharedUpdated = json.updated;
          localSharedDirty = false;
        })
        .catch(function () {})
        .then(function () { sharedSaving = false; });
    }

    function applySharedStrokes(raw, updated) {
      if (drawing || localSharedDirty) return;
      var next = normalizeStrokes(raw);
      if (sharedFingerprint(next) === sharedFingerprint(sharedStrokesByPage)) {
        if (updated) sharedUpdated = updated;
        return;
      }
      sharedStrokesByPage = next;
      if (updated) sharedUpdated = updated;
      redraw();
    }

    /** 제출 이미지에 이미 구워진 시험 필기(원본 좌표)는 올리지 않는다 */
    function isExamEraShared(updated) {
      if (!boot.inkBaked) return false;
      var bakedAtMs = (parseInt(boot.inkBakedAt, 10) || 0) * 1000;
      var upd = parseInt(updated, 10) || 0;
      if (!upd) return true;
      if (!bakedAtMs) return true;
      return upd <= bakedAtMs + 60000;
    }

    function pullShared() {
      if (!sharedEnabled) return;
      if (drawing || localSharedDirty || sharedSaving || sharedSaveTimer) return;
      var q = isHomework
        ? ('hw_id=' + encodeURIComponent(boot.hwId || boot.examId))
        : ('exam_id=' + encodeURIComponent(boot.examId));
      var url = boot.sharedUrl + '?' + q + '&mb_no=' + encodeURIComponent(boot.shareMb);
      fetch(url, { method: 'GET', credentials: 'same-origin', cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (json) {
          if (!json || !json.ok) return;
          if (drawing || localSharedDirty || sharedSaving) return;
          var upd = json.updated || 0;
          if (!upd || upd <= sharedUpdated) return;
          if (isExamEraShared(upd)) {
            sharedUpdated = upd;
            return;
          }
          applySharedStrokes(json.strokes, upd);
        })
        .catch(function () {});
    }

    function startSharedSync() {
      if (!sharedEnabled) return;
      if (!boot.inkBaked && boot.initialSharedStrokes) {
        applySharedStrokes(boot.initialSharedStrokes, 1);
      }
      pullShared();
      sharedPollTimer = setInterval(pullShared, 1500);
    }

    function pushStroke(st) {
      ensurePage(pageIndex);
      if (!st.id) st.id = newStrokeId();
      if (shareOnlyDraw) {
        sharedStrokesByPage[pageIndex].push(st);
        sharedUndoByPage[pageIndex].push(st);
        sharedRedoByPage[pageIndex] = [];
        scheduleSharedSave();
      } else {
        strokesByPage[pageIndex].push(st);
        undoByPage[pageIndex].push(st);
        redoByPage[pageIndex] = [];
        saveDraft();
        if (sharedEnabled) {
          sharedStrokesByPage[pageIndex].push(st);
          scheduleSharedSave();
        }
      }
    }

    function syncCursor() {
      canvas.classList.toggle('is-pan', tool === 'pan');
      canvas.classList.remove('is-panning');
    }

    function shouldCapturePointer(e) {
      if (e.pointerType === 'mouse') return true;
      // iPad Safari는 setPointerCapture가 pointercancel을 바로 일으켜 획이 끊김
      return !appleTouch;
    }

    function capturePointer(e) {
      if (!shouldCapturePointer(e)) return;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    }

    function releasePointer(e) {
      if (!e || !shouldCapturePointer(e)) return;
      try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    }

    function appendLiveSegment(from, to, st) {
      if (!from || !to || !st) return;
      ctx.save();
      if (st.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = st.color;
      }
      ctx.lineWidth = st.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.restore();
    }

    function finishStroke(e) {
      if (panning && (pointerId === null || !e || e.pointerId === pointerId)) {
        panning = false;
        panStart = null;
        pointerId = null;
        canvas.classList.remove('is-panning');
        releasePointer(e);
        if (e) e.preventDefault();
        return;
      }
      if (!drawing) return;
      if (e && pointerId !== null && e.pointerId !== pointerId) return;
      drawing = false;
      if (canvas._cur && canvas._cur.pts.length) pushStroke(canvas._cur);
      canvas._cur = null;
      pointerId = null;
      lastPt = null;
      releasePointer(e);
    }

    function onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 1) return;
      // 펜으로 그리는 중 손바닥(touch)은 무시
      if (drawing && e.pointerType === 'touch' && e.pointerId !== pointerId) {
        e.preventDefault();
        return;
      }
      if (tool === 'pen' || tool === 'eraser') {
        if (e.pointerType === 'touch' && !e.isPrimary) {
          e.preventDefault();
          return;
        }
      }

      if (tool === 'pan' || e.shiftKey || e.button === 1) {
        drawing = false;
        canvas._cur = null;
        panning = true;
        pointerId = e.pointerId;
        panStart = { x: e.clientX, y: e.clientY, px: panX, py: panY };
        canvas.classList.add('is-panning');
        capturePointer(e);
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (!e.isPrimary && e.pointerType === 'touch') return;
      drawing = true;
      pointerId = e.pointerId;
      lastPt = localPoint(e);
      canvas._cur = {
        tool: tool,
        color: color,
        size: tool === 'eraser' ? Math.max(size * 4, 16) : size,
        pts: [lastPt],
      };
      drawStroke(canvas._cur);
      capturePointer(e);
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (panning && panStart && (pointerId === null || e.pointerId === pointerId)) {
        panX = panStart.px + (e.clientX - panStart.x);
        panY = panStart.py + (e.clientY - panStart.y);
        applyTransform();
        e.preventDefault();
        return;
      }
      if (!drawing || e.pointerId !== pointerId) return;
      var st = canvas._cur;
      if (!st) return;
      var evs = (typeof e.getCoalescedEvents === 'function') ? e.getCoalescedEvents() : null;
      if (!evs || !evs.length) evs = [e];
      for (var i = 0; i < evs.length; i++) {
        var pt = localPoint(evs[i]);
        if (lastPt) appendLiveSegment(lastPt, pt, st);
        st.pts.push(pt);
        lastPt = pt;
      }
      e.preventDefault();
    }

    function onPointerUp(e) {
      finishStroke(e);
      if (e) e.preventDefault();
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('lostpointercapture', function (e) {
      if (drawing && e.pointerId === pointerId) {
        finishStroke(e);
        return;
      }
      if (panning) {
        panning = false;
        panStart = null;
        pointerId = null;
        canvas.classList.remove('is-panning');
      }
    });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    canvas.addEventListener('touchstart', function (e) { e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });

    stageWrap.addEventListener('wheel', function (e) {
      e.preventDefault();
      var delta = e.deltaY > 0 ? 0.9 : 1.1;
      var rect = stageWrap.getBoundingClientRect();
      var cx = e.clientX - rect.left;
      var cy = e.clientY - rect.top;
      var beforeX = (cx - panX) / scale;
      var beforeY = (cy - panY) / scale;
      scale = Math.min(4, Math.max(0.3, scale * delta));
      panX = cx - beforeX * scale;
      panY = cy - beforeY * scale;
      applyTransform();
    }, { passive: false });

    stageWrap.addEventListener('touchstart', function (e) {
      if (e.touches.length < 2) return;
      // 펜 필기 중 손바닥은 핀치가 아님
      if (drawing) {
        e.preventDefault();
        return;
      }
      panning = false;
      var a = e.touches[0];
      var b = e.touches[1];
      pinch = {
        dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
        scale: scale,
        panX: panX,
        panY: panY,
      };
    }, { passive: false });

    stageWrap.addEventListener('touchmove', function (e) {
      if (pinch && e.touches.length === 2) {
        e.preventDefault();
        var a = e.touches[0];
        var b = e.touches[1];
        var dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        var rect = stageWrap.getBoundingClientRect();
        var mx = (a.clientX + b.clientX) / 2 - rect.left;
        var my = (a.clientY + b.clientY) / 2 - rect.top;
        var ns = Math.min(4, Math.max(0.3, pinch.scale * (dist / pinch.dist)));
        var beforeX = (mx - pinch.panX) / pinch.scale;
        var beforeY = (my - pinch.panY) / pinch.scale;
        scale = ns;
        panX = mx - beforeX * scale;
        panY = my - beforeY * scale;
        applyTransform();
      }
    }, { passive: false });

    stageWrap.addEventListener('touchend', function (e) {
      if (!e.touches || e.touches.length < 2) pinch = null;
    });

    document.querySelectorAll('.mc_on_tool[data-tool]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        tool = btn.getAttribute('data-tool');
        document.querySelectorAll('.mc_on_tool[data-tool]').forEach(function (b) {
          b.classList.toggle('is-on', b === btn);
        });
        syncCursor();
      });
    });
    document.querySelectorAll('.mc_on_color').forEach(function (btn) {
      btn.addEventListener('click', function () {
        color = btn.getAttribute('data-color');
        tool = 'pen';
        document.querySelectorAll('.mc_on_color').forEach(function (b) {
          b.classList.toggle('is-on', b === btn);
        });
        document.querySelectorAll('.mc_on_tool[data-tool]').forEach(function (b) {
          b.classList.toggle('is-on', b.getAttribute('data-tool') === 'pen');
        });
        syncCursor();
      });
    });
    var sizeEl = document.getElementById('mc_on_size');
    if (sizeEl) {
      sizeEl.addEventListener('input', function () {
        size = parseInt(sizeEl.value, 10) || 3;
      });
    }
    document.getElementById('mc_on_undo').addEventListener('click', function () {
      ensurePage(pageIndex);
      if (shareOnlyDraw) {
        var sst = sharedUndoByPage[pageIndex].pop();
        if (!sst) return;
        sharedRedoByPage[pageIndex].push(sst);
        sharedStrokesByPage[pageIndex].pop();
        redraw();
        scheduleSharedSave();
        return;
      }
      var st = undoByPage[pageIndex].pop();
      if (!st) return;
      redoByPage[pageIndex].push(st);
      strokesByPage[pageIndex].pop();
      if (sharedEnabled && st.id) {
        var list = sharedStrokesByPage[pageIndex] || [];
        for (var i = list.length - 1; i >= 0; i--) {
          if (list[i] && list[i].id === st.id) {
            list.splice(i, 1);
            break;
          }
        }
        scheduleSharedSave();
      }
      redraw();
      saveDraft();
    });
    document.getElementById('mc_on_redo').addEventListener('click', function () {
      ensurePage(pageIndex);
      if (shareOnlyDraw) {
        var sst2 = sharedRedoByPage[pageIndex].pop();
        if (!sst2) return;
        sharedUndoByPage[pageIndex].push(sst2);
        sharedStrokesByPage[pageIndex].push(sst2);
        redraw();
        scheduleSharedSave();
        return;
      }
      var st2 = redoByPage[pageIndex].pop();
      if (!st2) return;
      undoByPage[pageIndex].push(st2);
      strokesByPage[pageIndex].push(st2);
      if (sharedEnabled) {
        sharedStrokesByPage[pageIndex].push(st2);
        scheduleSharedSave();
      }
      redraw();
      saveDraft();
    });
    document.getElementById('mc_on_zoom_in').addEventListener('click', function () {
      scale = Math.min(4, scale * 1.15);
      applyTransform();
    });
    document.getElementById('mc_on_zoom_out').addEventListener('click', function () {
      scale = Math.max(0.3, scale / 1.15);
      applyTransform();
    });
    document.getElementById('mc_on_zoom_reset').addEventListener('click', fitPage);
    document.getElementById('mc_on_prev').addEventListener('click', function () { setPage(pageIndex - 1); });
    document.getElementById('mc_on_next').addEventListener('click', function () { setPage(pageIndex + 1); });

    document.querySelectorAll('.mc_on_ans_input').forEach(function (inp) {
      inp.addEventListener('change', saveDraft);
      inp.addEventListener('blur', saveDraft);
    });

    function exportPageBlobs() {
      return new Promise(function (resolve) {
        var out = [];
        var i = 0;
        var MAX = 1280;

        function next() {
          if (i >= pages.length) {
            resolve(out);
            return;
          }
          var idx = i++;
          ensurePage(idx);
          var url = pages[idx] || '';
          var off = document.createElement('canvas');
          var octx = off.getContext('2d');

          function paintAndPush(srcW, srcH, drawBg) {
            var scaleDown = Math.min(1, MAX / Math.max(srcW, srcH));
            var w = Math.max(1, Math.round(srcW * scaleDown));
            var h = Math.max(1, Math.round(srcH * scaleDown));
            off.width = w;
            off.height = h;
            octx.fillStyle = '#fff';
            octx.fillRect(0, 0, w, h);
            if (drawBg) drawBg(octx, w, h);
            var strokes = strokesByPage[idx] || [];
            var sx = w / srcW;
            var sy = h / srcH;
            for (var s = 0; s < strokes.length; s++) {
              var st = strokes[s];
              if (!st || !st.pts || !st.pts.length) continue;
              octx.save();
              if (st.tool === 'eraser') {
                octx.globalCompositeOperation = 'destination-out';
                octx.strokeStyle = 'rgba(0,0,0,1)';
              } else {
                octx.globalCompositeOperation = 'source-over';
                octx.strokeStyle = st.color || '#1f2430';
              }
              octx.lineWidth = Math.max(1, (st.size || 3) * sx);
              octx.lineCap = 'round';
              octx.lineJoin = 'round';
              octx.beginPath();
              octx.moveTo(st.pts[0].x * sx, st.pts[0].y * sy);
              for (var p = 1; p < st.pts.length; p++) {
                octx.lineTo(st.pts[p].x * sx, st.pts[p].y * sy);
              }
              if (st.pts.length === 1) {
                octx.lineTo(st.pts[0].x * sx + 0.01, st.pts[0].y * sy);
              }
              octx.stroke();
              octx.restore();
            }
            off.toBlob(
              function (blob) {
                out.push(blob || new Blob());
                next();
              },
              'image/jpeg',
              0.72
            );
          }

          if (url) {
            var img = new Image();
            img.onload = function () {
              var sw = img.naturalWidth || 800;
              var sh = img.naturalHeight || 1100;
              paintAndPush(sw, sh, function (ctx2, w, h) {
                ctx2.drawImage(img, 0, 0, w, h);
              });
            };
            img.onerror = function () {
              paintAndPush(800, 1100, null);
            };
            img.src = url;
          } else {
            paintAndPush(800, 1100, null);
          }
        }
        next();
      });
    }

    async function doSubmit(opts) {
      opts = opts || {};
      var forceTimeout = !!opts.forceTimeout;
      if (!boot.submitUrl) return;
      if (window.__mcOnlineSubmitting) return;
      // 제출 직전 입력값을 다시 동기화
      document.querySelectorAll('.mc_on_ans_input').forEach(function (inp) {
        inp.blur();
      });
      saveDraft();
      var answers = collectAnswers();
      var keys = Object.keys(answers);
      var filled = keys.filter(function (k) {
        return String(answers[k]).trim() !== '';
      });
      if (!forceTimeout) {
        if (!keys.length || !filled.length) {
          await showDialog('단답이 비어 있습니다. 오른쪽 답안 패널에 답을 입력한 뒤 다시 제출해 주세요.');
          return;
        }
        if (filled.length < keys.length) {
          var goEmpty = await showDialog(
            '일부 문항(' + (keys.length - filled.length) + '개)이 비어 있습니다. 그래도 제출할까요?',
            [
              { label: '취소', value: false },
              { label: '제출', value: true, primary: true },
            ]
          );
          if (!goEmpty) return;
        }
        var go = await showDialog('제출하면 수정할 수 없습니다. 제출할까요?', [
          { label: '취소', value: false },
          { label: '제출', value: true, primary: true },
        ]);
        if (!go) return;
      }

      // 다이얼로그 중에 값이 바뀌었을 수 있어 한 번 더 수집
      answers = collectAnswers();
      window.__mcOnlineSubmitting = true;
      unlockLeave();
      if (sharedSaveTimer) {
        clearTimeout(sharedSaveTimer);
        sharedSaveTimer = null;
      }
      localSharedDirty = false;
      sharedEnabled = false;

      overlay.hidden = false;
      submitMsg.textContent = forceTimeout ? '제한시간 종료 — 자동 제출 중…' : '풀이 이미지 생성 중…';
      var blobs;
      try {
        blobs = await exportPageBlobs();
      } catch (err) {
        blobs = [];
      }

      submitMsg.textContent = forceTimeout ? '자동 제출 중…' : '제출 중…';
      try {
        var fd = new FormData();
        fd.append('exam_id', String(boot.examId));
        if (forceTimeout) fd.append('force_timeout', '1');
        // 답안은 JSON 파일로 전송 (POST 필드 누락 방지)
        var ansBlob = new Blob([JSON.stringify(answers)], { type: 'application/json' });
        fd.append('answers_file', ansBlob, 'answers.json');
        fd.append('mc_answers_json', JSON.stringify(answers));
        var strokeBlob = new Blob([JSON.stringify(strokesByPage)], { type: 'application/json' });
        fd.append('strokes_file', strokeBlob, 'strokes.json');
        Object.keys(answers).forEach(function (q) {
          fd.append('a_' + q, answers[q] == null ? '' : String(answers[q]));
        });
        for (var p = 0; p < blobs.length; p++) {
          fd.append('pages[]', blobs[p], 'page_' + (p + 1) + '.jpg');
        }
        var res = await fetch(boot.submitUrl, {
          method: 'POST',
          credentials: 'same-origin',
          body: fd,
        });
        var text = await res.text();
        var json = null;
        try {
          json = JSON.parse(text);
        } catch (parseErr) {
          overlay.hidden = true;
          window.__mcOnlineSubmitting = false;
          lockLeave();
          var hint = text && text.length < 200 ? text.replace(/<[^>]+>/g, ' ').trim() : '';
          await showDialog(
            '서버 응답을 해석하지 못했습니다.' +
              (res.status ? ' (HTTP ' + res.status + ')' : '') +
              (hint ? '\n' + hint : '')
          );
          return;
        }
        if (!json || !json.ok) {
          if (json && json.need_timeout && !forceTimeout) {
            return doSubmit({ forceTimeout: true });
          }
          overlay.hidden = true;
          window.__mcOnlineSubmitting = false;
          lockLeave();
          await showDialog((json && json.msg) || '제출에 실패했습니다.');
          return;
        }
        try {
          localStorage.removeItem(boot.storageKey);
        } catch (e) {}
        submitMsg.textContent = '제출 완료! 점수 ' + json.score + '점';
        setTimeout(function () {
          location.href = json.redirect || boot.listUrl;
        }, 600);
      } catch (err) {
        overlay.hidden = true;
        window.__mcOnlineSubmitting = false;
        lockLeave();
        await showDialog('네트워크 오류로 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    }

    function formatRemain(sec) {
      sec = Math.max(0, Math.floor(sec));
      var m = Math.floor(sec / 60);
      var s = sec % 60;
      return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    var leaveLocked = false;
    function onBeforeUnload(e) {
      if (!leaveLocked || window.__mcOnlineSubmitting) return;
      e.preventDefault();
      e.returnValue = '제출하지 않으면 나갈 수 없습니다.';
      return e.returnValue;
    }
    function onDocClick(e) {
      if (!leaveLocked || window.__mcOnlineSubmitting) return;
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      if (a.classList.contains('mc_on_backlink')) {
        e.preventDefault();
        showDialog('나가려면 반드시 답안을 제출해야 합니다.');
        return;
      }
      // 사이트 내 다른 메뉴/링크 차단 (같은 도메인)
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return;
      if (a.target === '_blank') {
        e.preventDefault();
        showDialog('시험 중에는 다른 페이지로 이동할 수 없습니다. 제출 후 이용해 주세요.');
        return;
      }
      e.preventDefault();
      showDialog('시험 중에는 나갈 수 없습니다. 답안을 제출해 주세요.');
    }
    function lockLeave() {
      leaveLocked = true;
      window.addEventListener('beforeunload', onBeforeUnload);
      document.addEventListener('click', onDocClick, true);
      document.body.classList.add('mc-on-exam-locked');
    }
    function unlockLeave() {
      leaveLocked = false;
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onDocClick, true);
      document.body.classList.remove('mc-on-exam-locked');
    }

    function startTimer() {
      if (!boot.locked) return;
      lockLeave();
      var timerEl = document.getElementById('mc_on_timer_val');
      var wrap = document.getElementById('mc_on_timer');
      var remain = typeof boot.remainingSec === 'number' ? boot.remainingSec : 0;
      var tickStart = Date.now();
      var baseRemain = remain;
      var autoDone = false;

      function paint() {
        var elapsed = Math.floor((Date.now() - tickStart) / 1000);
        var left = Math.max(0, baseRemain - elapsed);
        if (timerEl) timerEl.textContent = formatRemain(left);
        if (wrap) {
          wrap.classList.toggle('is-warn', left <= 60 && left > 0);
          wrap.classList.toggle('is-over', left <= 0);
        }
        if (left <= 0 && !autoDone) {
          autoDone = true;
          doSubmit({ forceTimeout: true });
        }
      }
      paint();
      setInterval(paint, 250);
    }

    function applyGrades(grades) {
      if (!grades || !grades.length) return;
      boot.grades = grades;
      var okCnt = 0;
      grades.forEach(function (g) {
        var qn = String(g.q_no);
        var li = document.querySelector('#mc_on_answer_list li[data-q="' + qn + '"]');
        if (!li) return;
        var ok = g.is_correct === 'Y';
        if (ok) okCnt += 1;
        li.classList.toggle('is-ok', ok);
        li.classList.toggle('is-bad', !ok);
        var mark = li.querySelector('.mc_on_grade_mark');
        if (mark) mark.textContent = ok ? 'O' : 'X';
        var inp = document.getElementById('mc_ans_' + qn);
        if (inp) {
          inp.value = g.student_answer == null ? '' : String(g.student_answer);
          inp.readOnly = true;
        }
      });
      var total = grades.length;
      var score = total > 0 ? Math.round((okCnt / total) * 100) : 0;
      boot.score = score;
      var scoreEl = document.getElementById('mc_on_score_live');
      if (scoreEl) scoreEl.textContent = String(score);
      var okEl = document.getElementById('mc_on_summary_ok');
      var totalEl = document.getElementById('mc_on_summary_total');
      if (okEl) okEl.textContent = String(okCnt);
      if (totalEl) totalEl.textContent = String(total);
    }

    function openSolutionModal() {
      var modal = document.getElementById('mc_on_sol_modal');
      var body = document.getElementById('mc_on_sol_body');
      var panel = document.getElementById('mc_on_sol_panel');
      if (!modal || !body) return;
      if (modal.parentNode !== document.body) {
        document.body.appendChild(modal);
      }
      var sols = boot.solutions || [];
      if (!sols.length) {
        body.innerHTML = '<p class="mc_on_sol_empty">등록된 해설지가 없습니다.</p>';
      } else {
        var html = '';
        sols.forEach(function (s, idx) {
          if (s.type === 'image') {
            html += '<a href="' + s.url + '" target="_blank" rel="noopener"><img src="' + s.url + '" alt="해설 ' + (idx + 1) + '"></a>';
          } else if (s.type === 'pdf') {
            html +=
              '<div class="mc_on_pdf_frame"><iframe src="' +
              s.url +
              '" title="해설 PDF"></iframe><a class="mc_on_pdf_open" href="' +
              s.url +
              '" target="_blank" rel="noopener">PDF 새 창</a></div>';
          } else {
            html += '<a class="mc_on_file_chip" href="' + s.url + '" target="_blank" rel="noopener">' + (s.name || '파일') + '</a>';
          }
        });
        body.innerHTML = html;
      }
      if (panel) {
        panel.style.transform = 'translate3d(0px, 0px, 0)';
        panel.dataset.ox = '0';
        panel.dataset.oy = '0';
      }
      modal.hidden = false;
      modal.classList.add('is-open');
      document.body.classList.add('mc-on-sol-open');
      bindSolutionDrag();
    }

    function closeSolutionModal() {
      var modal = document.getElementById('mc_on_sol_modal');
      if (!modal) return;
      modal.hidden = true;
      modal.classList.remove('is-open');
      document.body.classList.remove('mc-on-sol-open');
    }

    var solDragBound = false;
    function bindSolutionDrag() {
      if (solDragBound) return;
      var panel = document.getElementById('mc_on_sol_panel');
      var head = document.getElementById('mc_on_sol_drag');
      if (!panel || !head) return;
      solDragBound = true;

      var dragging = false;
      var pid = null;
      var startX = 0;
      var startY = 0;
      var baseX = 0;
      var baseY = 0;

      function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
      }

      function applyOffset(x, y) {
        var modal = document.getElementById('mc_on_sol_modal');
        if (!modal) return;
        var mr = modal.getBoundingClientRect();
        var pr = panel.getBoundingClientRect();
        var curX = parseFloat(panel.dataset.ox || '0') || 0;
        var curY = parseFloat(panel.dataset.oy || '0') || 0;
        var baseLeft = pr.left - curX;
        var baseTop = pr.top - curY;
        var minX = 8 - baseLeft;
        var maxX = mr.width - pr.width - 8 - baseLeft;
        var minY = 8 - baseTop;
        var maxY = mr.height - pr.height - 8 - baseTop;
        if (maxX < minX) {
          x = (minX + maxX) / 2;
        } else {
          x = clamp(x, minX, maxX);
        }
        if (maxY < minY) {
          y = (minY + maxY) / 2;
        } else {
          y = clamp(y, minY, maxY);
        }
        panel.dataset.ox = String(x);
        panel.dataset.oy = String(y);
        panel.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      }

      function onDown(e) {
        if (e.target && e.target.closest && e.target.closest('#mc_on_sol_close')) return;
        dragging = true;
        pid = e.pointerId;
        try {
          head.setPointerCapture(pid);
        } catch (err) {}
        startX = e.clientX;
        startY = e.clientY;
        baseX = parseFloat(panel.dataset.ox || '0') || 0;
        baseY = parseFloat(panel.dataset.oy || '0') || 0;
        head.classList.add('is-dragging');
        e.preventDefault();
      }
      function onMove(e) {
        if (!dragging || (pid != null && e.pointerId !== pid)) return;
        applyOffset(baseX + (e.clientX - startX), baseY + (e.clientY - startY));
      }
      function onUp(e) {
        if (!dragging || (pid != null && e.pointerId !== pid)) return;
        dragging = false;
        pid = null;
        head.classList.remove('is-dragging');
        try {
          head.releasePointerCapture(e.pointerId);
        } catch (err) {}
      }

      head.addEventListener('pointerdown', onDown);
      head.addEventListener('pointermove', onMove);
      head.addEventListener('pointerup', onUp);
      head.addEventListener('pointercancel', onUp);
    }

    function setupReviewMode() {
      if (boot.mode !== 'review' && !isHomework) return;

      if (!isHomework) {
        var workspace = document.getElementById('mc_on_workspace');
        var panel = document.getElementById('mc_on_answer_panel');
        var ansToggle = document.getElementById('mc_on_ans_toggle');
        if (workspace && panel && !panel.hasAttribute('hidden')) {
          workspace.classList.add('is-panel-open');
          document.body.classList.add('mc-on-ans-open');
          if (panel.parentNode !== document.body) document.body.appendChild(panel);
          if (ansToggle) {
            ansToggle.classList.add('is-primary');
            ansToggle.setAttribute('aria-expanded', 'true');
            var lbl = ansToggle.querySelector('.mc_on_panel_btn_lbl');
            if (lbl) lbl.textContent = '답안 닫기';
          }
        }
        applyGrades(boot.grades || []);
        document.querySelectorAll('.mc_on_ans_input').forEach(function (inp) {
          inp.readOnly = true;
          inp.classList.add('is-readonly');
        });
      }

      var solBtn = document.getElementById('mc_on_sol_btn');
      var solClose = document.getElementById('mc_on_sol_close');
      var solBackdrop = document.getElementById('mc_on_sol_backdrop');
      if (solBtn) solBtn.addEventListener('click', openSolutionModal);
      if (solClose) solClose.addEventListener('click', closeSolutionModal);
      if (solBackdrop) solBackdrop.addEventListener('click', closeSolutionModal);
    }

    var btn = document.getElementById('mc_on_submit_btn');
    if (btn) btn.addEventListener('click', function () { doSubmit(); });

    window.addEventListener('resize', fitPage);
    syncCursor();
    loadDraft();
    setPage(Math.min(Math.max(0, pageIndex), Math.max(0, pages.length - 1)));
    startTimer();
    setupReviewMode();
    startSharedSync();
  }

  function init() {
    bindAnswerPanel();
    startCanvas();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
