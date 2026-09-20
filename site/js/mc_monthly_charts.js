/**
 * 월별 통계 — 점수 추이 + 강점/약점 가로 막대
 */
(function () {
  var ORANGE = '#fe7013';
  var AVG = '#9a9a9a';
  var MAX = '#4a4a4a';
  var GREEN = '#5a9a82';
  var INK = '#333333';
  var MUTED = '#8a8a8a';
  var GRID = 'rgba(0, 0, 0, 0.06)';

  function fontFamily() {
    return "'Noto Sans KR', 'Apple SD Gothic Neo', Malgun Gothic, sans-serif";
  }

  function isMobile() {
    return window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  }

  function shortLabel(text, maxLen) {
    if (typeof text !== 'string') return text;
    if (text.length <= maxLen) return text;
    return text.slice(0, Math.max(1, maxLen - 1)) + '…';
  }

  function chartDpr() {
    var dpr = window.devicePixelRatio || 1;
    return Math.min(dpr, 3);
  }

  function boot() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.font.family = fontFamily();
    Chart.defaults.font.size = 12;
    Chart.defaults.color = MUTED;
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.animation.duration = 680;
    Chart.defaults.animation.easing = 'easeOutQuart';
    renderTrend();
    renderUnitBar('mc_ms_strength_chart', window.MC_MONTHLY_STRENGTH || [], GREEN, true);
    renderUnitBar('mc_ms_weakness_chart', window.MC_MONTHLY_WEAKNESS || [], ORANGE, false);
  }

  /* ── 커스텀 툴팁 (추이) ── */
  function getOrCreateTrendTip() {
    var el = document.getElementById('mc_ms_trend_tip');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'mc_ms_trend_tip';
    el.className = 'mc_ms_chart_tip';
    el.setAttribute('role', 'tooltip');
    el.setAttribute('hidden', '');
    document.body.appendChild(el);
    return el;
  }

  function hideTrendTip() {
    var el = document.getElementById('mc_ms_trend_tip');
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

  function externalTrendTooltip(context) {
    var tip = getOrCreateTrendTip();
    var tooltip = context.tooltip;
    var chart = context.chart;
    var data = window.MC_MONTHLY_TREND || [];

    if (!tooltip || tooltip.opacity === 0 || !tooltip.dataPoints || !tooltip.dataPoints.length) {
      hideTrendTip();
      return;
    }

    var idx = tooltip.dataPoints[0].dataIndex;
    var point = data[idx] || {};
    var title = point.label || '';
    if (point.type) title += ' · ' + point.type;

    var rows = [
      { cls: 'is-my', label: '내 점수', value: point.my != null ? point.my + '점' : '—' },
      { cls: 'is-avg', label: '반 평균', value: point.avg != null ? point.avg + '점' : '—' },
      { cls: 'is-max', label: '최고점', value: point.max != null ? point.max + '점' : '—' }
    ];

    var html = '<div class="mc_ms_chart_tip_title">' + escapeHtml(title) + '</div><ul class="mc_ms_chart_tip_list">';
    rows.forEach(function (r) {
      html += '<li class="' + r.cls + '"><i></i><span>' + escapeHtml(r.label) + '</span><em>' + escapeHtml(r.value) + '</em></li>';
    });
    html += '</ul>';
    tip.innerHTML = html;
    tip.removeAttribute('hidden');
    tip.classList.add('is-visible');
    placeTip(tip, chart.canvas, tooltip.caretX, tooltip.caretY);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── 커스텀 툴팁 (막대) ── */
  function getOrCreateBarTip() {
    var el = document.getElementById('mc_ms_bar_tip');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'mc_ms_bar_tip';
    el.className = 'mc_ms_chart_tip';
    el.setAttribute('role', 'tooltip');
    el.setAttribute('hidden', '');
    document.body.appendChild(el);
    return el;
  }

  function hideBarTip() {
    var el = document.getElementById('mc_ms_bar_tip');
    if (el) {
      el.setAttribute('hidden', '');
      el.classList.remove('is-visible');
    }
  }

  function externalBarTooltip(items) {
    return function (context) {
      var tip = getOrCreateBarTip();
      var tooltip = context.tooltip;
      var chart = context.chart;

      if (!tooltip || tooltip.opacity === 0 || !tooltip.dataPoints || !tooltip.dataPoints.length) {
        hideBarTip();
        return;
      }

      var i = tooltip.dataPoints[0].dataIndex;
      var d = items[i] || {};
      var lines = [
        { label: '정답률', value: (d.rate != null ? d.rate : 0) + '%' },
        { label: '정답', value: (d.ok != null ? d.ok : 0) + ' / ' + (d.total != null ? d.total : 0) }
      ];
      if ((d.student_count || 0) <= 1) {
        lines.push({ label: '반원', value: '1명' });
      } else if (d.percentile != null) {
        lines.push({ label: '상위', value: d.percentile + '%' });
      }

      var html = '<div class="mc_ms_chart_tip_title">' + escapeHtml(d.name || '') + '</div><ul class="mc_ms_chart_tip_list is-plain">';
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

  function trendYRange(data) {
    var vals = [];
    data.forEach(function (d) {
      [d.my, d.avg, d.max].forEach(function (v) {
        if (typeof v === 'number' && !isNaN(v)) vals.push(v);
      });
    });
    if (!vals.length) return { min: 0, max: 100 };

    var lo = Math.min.apply(null, vals);
    var hi = Math.max.apply(null, vals);
    var span = hi - lo;
    var pad = Math.max(10, Math.round(span * 0.28));
    if (span < 12) pad = Math.max(pad, 14);

    var min = Math.max(0, Math.floor((lo - pad) / 5) * 5);
    var max = Math.min(100, Math.ceil((hi + pad) / 5) * 5);
    if (max - min < 24) {
      var mid = (lo + hi) / 2;
      min = Math.max(0, Math.floor((mid - 14) / 5) * 5);
      max = Math.min(100, Math.ceil((mid + 14) / 5) * 5);
    }
    if (min === max) {
      min = Math.max(0, min - 10);
      max = Math.min(100, max + 10);
    }
    return { min: min, max: max };
  }

  function renderTrend() {
    if (!window.MC_MONTHLY_TREND || !window.MC_MONTHLY_TREND.length) return;
    var el = document.getElementById('mc_ms_trend_chart');
    if (!el) return;

    var data = window.MC_MONTHLY_TREND;
    var mobile = isMobile();
    var wrap = el.closest('.mc_ms_trend_wrap');
    var n = data.length;
    var yRange = trendYRange(data);
    var sidePad = mobile ? 28 : 40;
    var hiScore = 0;
    data.forEach(function (d) {
      [d.my, d.avg, d.max].forEach(function (v) {
        if (typeof v === 'number' && !isNaN(v) && v > hiScore) hiScore = v;
      });
    });
    var nearTop = hiScore >= 95 || yRange.max >= 100;
    var topPad = mobile ? 12 : 18;
    // 100점 근처면 스케일 상한을 살짝 올려 점 반지름이 잘리지 않게 함 (Y틱 숨김)
    var yMax = yRange.max;
    if (nearTop && hiScore >= 95) {
      yMax = Math.max(yRange.max, Math.min(112, Math.ceil(hiScore + (mobile ? 12 : 10))));
    }

    if (wrap) {
      if (mobile) {
        // 모바일: 기본은 컨테이너 폭에 맞춤. 포인트 많을 때만 가벼운 스크롤
        if (n >= 8) {
          wrap.classList.add('is-scroll');
          el.style.minWidth = Math.max(wrap.clientWidth || 0, n * 56 + sidePad * 2) + 'px';
        } else {
          wrap.classList.remove('is-scroll');
          el.style.minWidth = '';
        }
      } else if (n >= 4) {
        wrap.classList.add('is-scroll');
        el.style.minWidth = Math.max(480, n * 80 + sidePad * 2) + 'px';
      }
    }

    document.addEventListener('scroll', hideTrendTip, true);
    window.addEventListener('resize', hideTrendTip);

    new Chart(el, {
      type: 'line',
      data: {
        labels: data.map(function (d) { return d.label; }),
        datasets: [
          {
            label: '내 점수',
            data: data.map(function (d) { return d.my; }),
            borderColor: ORANGE,
            backgroundColor: ORANGE,
            borderWidth: mobile ? 2.5 : 3,
            fill: false,
            pointRadius: mobile ? 4.5 : 5.5,
            pointHoverRadius: mobile ? 6.5 : 7.5,
            pointBackgroundColor: ORANGE,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: ORANGE,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            tension: 0,
            order: 1
          },
          {
            label: '반 평균',
            data: data.map(function (d) { return d.avg; }),
            borderColor: AVG,
            backgroundColor: AVG,
            borderWidth: mobile ? 1.75 : 2,
            borderDash: [6, 5],
            fill: false,
            pointRadius: mobile ? 3.5 : 4,
            pointHoverRadius: 5.5,
            pointBackgroundColor: AVG,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: AVG,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            tension: 0,
            order: 2
          },
          {
            label: '최고점',
            data: data.map(function (d) { return d.max; }),
            borderColor: MAX,
            backgroundColor: MAX,
            borderWidth: mobile ? 1.75 : 2,
            fill: false,
            pointRadius: mobile ? 3.5 : 4,
            pointHoverRadius: 5.5,
            pointBackgroundColor: MAX,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: MAX,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            tension: 0,
            order: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: chartDpr(),
        clip: nearTop ? false : true,
        interaction: { mode: 'index', intersect: false },
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove', 'touchend'],
        layout: {
          padding: {
            top: topPad,
            right: sidePad,
            left: sidePad,
            bottom: mobile ? 4 : 6
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: externalTrendTooltip
          }
        },
        scales: {
          x: {
            offset: true,
            grid: { display: false, drawBorder: false },
            border: { display: false },
            ticks: {
              color: mobile ? '#777' : '#888',
              font: {
                size: 12,
                weight: mobile ? '600' : '500',
                family: fontFamily()
              },
              maxRotation: 0,
              autoSkip: false,
              padding: mobile ? 6 : 12
            }
          },
          y: {
            min: yRange.min,
            max: yMax,
            ticks: { display: false },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.04)',
              drawTicks: false,
              lineWidth: 1,
              borderDash: [4, 4]
            },
            border: { display: false }
          }
        }
      }
    });
  }

  var barValueLabels = {
    id: 'mcMsBarValueLabels',
    afterDatasetsDraw: function (chart) {
      var meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data) return;
      var ctx = chart.ctx;
      ctx.save();
      ctx.font = '600 11px ' + fontFamily();
      ctx.fillStyle = '#777';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      meta.data.forEach(function (bar, i) {
        var v = chart.data.datasets[0].data[i];
        if (v == null) return;
        var pos = bar.tooltipPosition();
        ctx.fillText(String(v) + '%', pos.x + 6, pos.y);
      });
      ctx.restore();
    }
  };

  function renderUnitBar(canvasId, items, color, isStrength) {
    var el = document.getElementById(canvasId);
    if (!el || !items.length) return;

    var mobile = isMobile();
    var wrap = el.closest('.mc_ms_bar_wrap');
    var n = items.length;
    var labels = items.map(function (d) { return d.name; });
    var rates = items.map(function (d) { return d.rate; });

    if (wrap) {
      var rowH = mobile ? 42 : 46;
      var padH = mobile ? 28 : 36;
      wrap.style.height = Math.max(mobile ? 120 : 140, padH + n * rowH) + 'px';
    }

    document.addEventListener('scroll', hideBarTip, true);
    window.addEventListener('resize', hideBarTip);

    new Chart(el, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: rates,
          backgroundColor: color,
          hoverBackgroundColor: isStrength ? '#4d8a72' : '#e5630d',
          borderWidth: 0,
          borderRadius: 0,
          borderSkipped: false,
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
        devicePixelRatio: chartDpr(),
        interaction: { mode: 'index', intersect: false, axis: 'y' },
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove', 'touchend'],
        layout: {
          padding: {
            top: mobile ? 4 : 8,
            right: mobile ? 40 : 48,
            left: 0,
            bottom: mobile ? 4 : 8
          }
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            grid: { color: GRID, drawTicks: false, lineWidth: 1 },
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
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: externalBarTooltip(items)
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
