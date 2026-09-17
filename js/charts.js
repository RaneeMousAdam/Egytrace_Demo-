/* ═══════════════════════════════════════════════════════════════
   charts.js — Chart.js 4 Wrappers
   Enterprise light theme — semantic color palette, clean tooltips.
   ═══════════════════════════════════════════════════════════════ */

window._chartInstances = {};
window._pendingCharts  = [];

/** Destroy a chart by canvas ID before re-creating it */
function destroyChart(id) {
  if (window._chartInstances[id]) {
    window._chartInstances[id].destroy();
    delete window._chartInstances[id];
  }
}

/** Register all pending chart init functions after page render */
function flushCharts() {
  window._pendingCharts.forEach(fn => { try { fn(); } catch(e) { console.warn('Chart error:', e); } });
  window._pendingCharts = [];
}

/** Common Chart.js defaults — light enterprise theme */
const CHART_DEFAULTS = {
  font: { family: "'Inter', sans-serif", size: 11 },
  color: '#94A3B8',
  borderColor: '#E2E8F0',
  gridColor: '#E2E8F0',
};

/** CO2 component palette — semantic colors only */
const CO2_COLORS = {
  'Process CO2':         '#1677FF',
  'Fuel Combustion CO2': '#D97706',
  'Indirect Grid CO2':   '#64748B',
  'Biogenic CO2 Memo':   '#16A34A',
};

const FUEL_COLORS = ['#1677FF', '#D97706', '#16A34A', '#64748B', '#DC2626', '#2563EB'];

/** Shared tooltip config */
const TOOLTIP_CFG = {
  backgroundColor: '#FFFFFF',
  borderColor: '#E2E8F0',
  borderWidth: 1,
  titleColor: '#172B4D',
  bodyColor: '#64748B',
  padding: 12,
};

/**
 * Donut chart — CO2 component breakdown
 */
function registerDonutChart(id, breakdown) {
  window._pendingCharts.push(function() {
    destroyChart(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const labels = breakdown.map(d => d.component);
    const data   = breakdown.map(d => d.tCO2);
    const colors = labels.map(l => CO2_COLORS[l] || '#1677FF');

    window._chartInstances[id] = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#FFFFFF', hoverOffset: 6, borderWidth: 3, borderRadius: 3 }] },
      options: {
        cutout: '72%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const val = ctx.parsed;
                const pct = breakdown[ctx.dataIndex] ? (breakdown[ctx.dataIndex].share * 100).toFixed(1) + '%' : '';
                return `  ${ctx.label}: ${new Intl.NumberFormat('en-US').format(val)} tCO2 (${pct})`;
              }
            },
            ...TOOLTIP_CFG,
          }
        }
      }
    });
  });
}

/**
 * Stacked bar chart
 */
function registerStackedBarChart(id, labels, datasets, yUnit) {
  window._pendingCharts.push(function() {
    destroyChart(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const ds = datasets.map((d, i) => ({
      label: d.label,
      data: d.data,
      backgroundColor: d.color || FUEL_COLORS[i % FUEL_COLORS.length],
      borderRadius: 3,
      borderSkipped: false,
    }));

    window._chartInstances[id] = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: ds },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { color: CHART_DEFAULTS.gridColor }, ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font } },
          y: { stacked: true, grid: { color: CHART_DEFAULTS.gridColor }, ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font,
               callback: v => new Intl.NumberFormat('en-US',{notation:'compact'}).format(v) + (yUnit?' '+yUnit:'') } }
        },
        plugins: {
          legend: { labels: { color: '#64748B', font: CHART_DEFAULTS.font, boxWidth: 10, boxHeight: 10 } },
          tooltip: { ...TOOLTIP_CFG, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${new Intl.NumberFormat('en-US').format(ctx.parsed.y)}${yUnit?' '+yUnit:''}` } }
        }
      }
    });
  });
}

/**
 * Multi-line chart
 */
function registerLineChart(id, labels, datasets, yUnit) {
  window._pendingCharts.push(function() {
    destroyChart(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const ds = datasets.map((d, i) => {
      const color = d.color || FUEL_COLORS[i % FUEL_COLORS.length];
      return {
        label: d.label,
        data: d.data,
        borderColor: color,
        backgroundColor: color + '18',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: color,
        tension: 0.3,
        fill: datasets.length === 1,
      };
    });

    window._chartInstances[id] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: ds },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: CHART_DEFAULTS.gridColor }, ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font } },
          y: { grid: { color: CHART_DEFAULTS.gridColor }, ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font,
               callback: v => new Intl.NumberFormat('en-US',{notation:'compact'}).format(v) } }
        },
        plugins: {
          legend: { labels: { color: '#64748B', font: CHART_DEFAULTS.font, boxWidth: 10, boxHeight: 10 } },
          tooltip: { ...TOOLTIP_CFG, callbacks: { label: ctx => `  ${ctx.dataset.label}: ${new Intl.NumberFormat('en-US').format(ctx.parsed.y)}${yUnit?' '+yUnit:''}` } }
        }
      }
    });
  });
}

/**
 * Horizontal bar chart — QA category breakdown
 */
function registerHBarChart(id, labels, data, colors) {
  window._pendingCharts.push(function() {
    destroyChart(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    window._chartInstances[id] = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderRadius: 3, borderSkipped: false }] },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: CHART_DEFAULTS.gridColor }, ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font, stepSize: 1 } },
          y: { grid: { display: false }, ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font } }
        },
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    });
  });
}

/**
 * Grouped bar chart
 */
function registerGroupedBarChart(id, labels, datasets, yUnit) {
  window._pendingCharts.push(function() {
    destroyChart(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const ds = datasets.map((d, i) => ({
      label: d.label,
      data: d.data,
      backgroundColor: d.color || FUEL_COLORS[i],
      borderRadius: 3,
    }));

    window._chartInstances[id] = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: ds },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: CHART_DEFAULTS.gridColor }, ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font } },
          y: { grid: { color: CHART_DEFAULTS.gridColor }, ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font,
               callback: v => new Intl.NumberFormat('en-US',{notation:'compact'}).format(v) + (yUnit?' '+yUnit:'') } }
        },
        plugins: {
          legend: { labels: { color: '#64748B', font: CHART_DEFAULTS.font, boxWidth: 10, boxHeight: 10 } },
          tooltip: { ...TOOLTIP_CFG }
        }
      }
    });
  });
}

window.registerDonutChart      = registerDonutChart;
window.registerStackedBarChart = registerStackedBarChart;
window.registerLineChart       = registerLineChart;
window.registerHBarChart       = registerHBarChart;
window.registerGroupedBarChart = registerGroupedBarChart;
window.flushCharts             = flushCharts;
window.destroyChart            = destroyChart;
window.CO2_COLORS              = CO2_COLORS;
window.FUEL_COLORS             = FUEL_COLORS;
