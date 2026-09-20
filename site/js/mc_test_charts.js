/**
 * 테스트 현황 — 난이도 방사형 / 소단원 막대
 */
(function () {
  var ORANGE = '#fe7013';
  var INK = '#333333';
  var MUTED = '#8a8a8a';
  var GRID = 'rgba(0, 0, 0, 0.06)';

  function fontFamily() {
    return "'Noto Sans KR', 'Apple SD Gothic Neo', Malgun Gothic, sans-serif";
  }

  function isMobile() {
    return window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  }

  /** 소단원명 말줄임 */
  function shortLabel(text, maxLen) {
    if (typeof text !== 'string') return text;
    if (text.length <= maxLen) return text;
    return text.slice(0, Math.max(1, maxLen - 1)) + '…';
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getOrCreateBarTip() {
    var el = document.getElementById('mc_ts_bar_tip');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'mc_ts_bar_tip';
    el.className = 'mc_ms_chart_tip';
    el.setAttribute('role', 'tooltip');
    el.setAttribute('hidden', '');
    document.body.appendChild(el);
    return el;
  }

  function hideBarTip() {
    var el = document.getElementById('mc_ts_bar_tip');
    if (el) {
      el.setAttribute('hidden', '');
      el.classList.remove('is-visible');
    }
  }

  function placeTip(el, canvas, caretX, caretY) {
    var rect = canvas.getBoundingClientRect();
    var tipW = el.offsetWidth || 180;
    var tipH = el.offsetHeight || 120;
    var pad = 12;
    var left = rect.left + window.scrollX + caretX - tipW / 2;
    var top = rect.top + window.scrollY + caretY - tipH - 14;

    var maxL = window.scrollX + window.innerWidth - tipW - pad;
    var minL = window.scrollX + pad;
    if (left < minL) left = minL;
    if (left > maxL) left = maxL;

    if (top < window.scrollY + pad) {
      top = rect.top + window.scrollY + caretY + 18;
      el.classList.add('is-below');
    } else {
      el.classList.remove('is-below');
    }

    el.style.left = Math.round(left) + 'px';
    el.style.top = Math.round(top) + 'px';
  }

  function externalBarTooltip(labels, details) {
    return function (context) {
      var tip = getOrCreateBarTip();
      var tooltip = context.tooltip;
      var chart = context.chart;

      if (!tooltip || tooltip.opacity === 0 || !tooltip.dataPoints || !tooltip.dataPoints.length) {
        hideBarTip();
        return;
      }

      var i = tooltip.dataPoints[0].dataIndex;
      var d = details[i] || {};
      var title = (d.name != null && d.name !== '') ? d.name : ((labels[i] != null) ? labels[i] : '');
      var h = (typeof d.H === 'number') ? d.H : 0;
      var m = (typeof d.M === 'number') ? d.M : 0;
      var l = (typeof d.L === 'number') ? d.L : 0;
      var lines = [
        { label: '상', value: h + '%' },
        { label: '중', value: m + '%' },
        { label: '하', value: l + '%' }
      ];

      var html = '<div class="mc_ms_chart_tip_title">' + escapeHtml(title) + '</div><ul class="mc_ms_chart_tip_list is-plain">';
      lines.forEach(function (r) {
        html += '<li><span>' + escapeHtml(r.label) + '</span><em>' + escapeHtml(r.value) + '</em></li>';
      });
      html += '</ul>';
      tip.innerHTML = html;
      tip.removeAttribute('hidden');
      tip.classList.add('is-visible');
      placeTip(tip, chart.canvas, tooltip.caretX, tooltip.caretY);
    };
  }

  function boot() {
    if (typeof Chart === 'undefined' || !window.MC_TEST_CHARTS || !window.MC_TEST_CHARTS.length) {
      return;
    }

    Chart.defaults.font.family = fontFamily();
    Chart.defaults.font.size = 12;
    Chart.defaults.color = MUTED;
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.animation.duration = 680;
    Chart.defaults.animation.easing = 'easeOutQuart';

    window.MC_TEST_CHARTS.forEach(function (item) {
      renderRadar(item);
      renderBar(item);
    });
  }

  function renderRadar(item) {
    var el = document.getElementById(item.radarId);
    if (!el) return;
    var mobile = isMobile();

    new Chart(el, {
      type: 'radar',
      data: {
        labels: ['상', '중', '하'],
        datasets: [{
          data: item.diff || [0, 0, 0],
          backgroundColor: 'rgba(254, 112, 19, 0.16)',
          borderColor: ORANGE,
          borderWidth: 2,
          fill: true,
          pointBackgroundColor: ORANGE,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: mobile ? 4 : 5,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: ORANGE,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        layout: {
          padding: mobile
            ? { top: 10, right: 12, bottom: 6, left: 12 }
            : { top: 14, right: 16, bottom: 10, left: 16 }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            beginAtZero: true,
            ticks: {
              display: true,
              count: 5,
              stepSize: 25,
              showLabelBackdrop: true,
              backdropColor: 'rgba(255,255,255,0.75)',
              backdropPadding: 2,
              color: '#b0b0b0',
              font: { size: 9, weight: '500', family: fontFamily() },
              callback: function (v) {
                if (v === 0) return '';
                return v;
              },
              z: 0
            },
            grid: {
              color: function (ctx) {
                var idx = ctx.index;
                var last = ctx.scale && ctx.scale.ticks ? ctx.scale.ticks.length - 1 : 4;
                return idx === last ? 'rgba(0,0,0,0.10)' : GRID;
              },
              circular: true,
              lineWidth: 1
            },
            angleLines: {
              color: 'rgba(0,0,0,0.08)',
              lineWidth: 1
            },
            pointLabels: {
              color: INK,
              font: {
                size: mobile ? 13 : 14,
                weight: '700',
                family: fontFamily()
              },
              padding: mobile ? 8 : 12
            }
          }
        },
        plugins: {
          tooltip: {
            backgroundColor: '#222',
            titleColor: '#fff',
            bodyColor: '#fff',
            titleFont: { size: 12, weight: '600', family: fontFamily() },
            bodyFont: { size: 12, family: fontFamily() },
            padding: 10,
            cornerRadius: 2,
            displayColors: false,
            callbacks: {
              title: function () { return ''; },
              label: function (ctx) {
                var n = ctx.parsed && typeof ctx.parsed.r === 'number' ? ctx.parsed.r : ctx.raw;
                return ctx.label + '  ' + n + '%';
              }
            }
          }
        }
      }
    });
  }

  var barValueLabels = {
    id: 'mcTsBarValueLabels',
    afterDatasetsDraw: function (chart) {
      var meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data) return;
      var horizontal = chart.options.indexAxis === 'y';
      var ctx = chart.ctx;
      ctx.save();
      ctx.font = '600 11px ' + fontFamily();
      ctx.fillStyle = '#777';
      ctx.textBaseline = 'middle';

      meta.data.forEach(function (bar, i) {
        var v = chart.data.datasets[0].data[i];
        if (v == null) return;
        var pos = bar.tooltipPosition();
        if (horizontal) {
          ctx.textAlign = 'left';
          ctx.fillText(String(v) + '%', pos.x + 6, pos.y);
        } else {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(String(v), pos.x, pos.y - 5);
        }
      });
      ctx.restore();
    }
  };

  function renderBar(item) {
    var el = document.getElementById(item.barId);
    if (!el) return;
    var labels = item.unitLabels || [];
    var scores = item.unitScores || [];
    var details = item.unitDetails || [];
    if (!labels.length) return;

    var wrap = el.closest('.mc_ts_bar_wrap');
    var n = labels.length;
    var mobile = isMobile();

    if (wrap) {
      wrap.classList.remove('is-scroll');
      el.style.minWidth = '';
      var rowH = mobile ? 42 : 46;
      var padH = mobile ? 28 : 36;
      wrap.style.height = Math.max(mobile ? 160 : 180, padH + n * rowH) + 'px';
    }

    document.addEventListener('scroll', hideBarTip, true);
    window.addEventListener('resize', hideBarTip);

    new Chart(el, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: scores,
          backgroundColor: ORANGE,
          hoverBackgroundColor: '#e5630d',
          borderWidth: 0,
          borderRadius: 0,
          borderSkipped: false,
          // 0%여도 터치·클릭 가능하도록 최소 길이 확보
          minBarLength: 6,
          maxBarThickness: mobile ? 16 : 20,
          categoryPercentage: 0.7,
          barPercentage: 0.75
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        // 행 어디를 눌러도 해당 소단원 툴팁
        interaction: {
          mode: 'index',
          intersect: false,
          axis: 'y'
        },
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove', 'touchend'],
        layout: {
          padding: {
            top: mobile ? 4 : 8,
            right: mobile ? 36 : 44,
            left: 0,
            bottom: mobile ? 4 : 8
          }
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            grid: {
              color: GRID,
              drawTicks: false,
              lineWidth: 1
            },
            border: { display: false },
            ticks: {
              stepSize: 50,
              color: '#b0b0b0',
              font: { size: 10, weight: '500', family: fontFamily() },
              callback: function (v) { return v + '%'; },
              padding: 4
            }
          },
          y: {
            grid: { display: false, drawBorder: false },
            border: { display: false },
            ticks: {
              color: '#555',
              font: {
                size: mobile ? 11 : 12,
                weight: '500',
                family: fontFamily()
              },
              padding: mobile ? 8 : 10,
              autoSkip: false,
              callback: function (val) {
                return shortLabel(this.getLabelForValue(val), mobile ? 8 : 12);
              }
            }
          }
        },
        plugins: {
          tooltip: {
            enabled: false,
            external: externalBarTooltip(labels, details)
          }
        }
      },
      plugins: [barValueLabels]
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
