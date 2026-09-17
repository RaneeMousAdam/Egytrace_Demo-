/* ═══════════════════════════════════════════════════════════════
   charts.js — Chart.js 4 Wrappers
   All chart instances tracked so they can be destroyed on re-render.
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

/** Common Chart.js defaults */
const CHART_DEFAULTS = {
  font: { family: "'Inter', sans-serif", size: 11 },
  color: 'rgba(143,163,200,0.9)',
  borderColor: 'rgba(255,255,255,0.06)',
  gridColor: 'rgba(255,255,255,0.06)',
};

/** CO2 palette */
const CO2_COLORS = {
  'Process CO2':       '#00d4aa',
  'Fuel Combustion CO2': '#f59e0b',
  'Indirect Grid CO2': '#4facfe',
  'Biogenic CO2 Memo': '#a78bfa',
};

const FUEL_COLORS = ['#00d4aa','#f59e0b','#4facfe','#a78bfa','#fb923c','#34d399'];

/**
 * Donut chart — CO2 component breakdown
 * @param {string} id - canvas element id
 * @param {Array}  breakdown - [{component, tCO2, share}]
 */
function registerDonutChart(id, breakdown) {
  window._pendingCharts.push(function() {
    destroyChart(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const labels  = breakdown.map(d => d.component);
    const data    = breakdown.map(d => d.tCO2);
    const colors  = labels.map(l => CO2_COLORS[l] || '#60a5fa');

    window._chartInstances[id] = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: 'rgba(0,0,0,0)', hoverOffset: 8, borderWidth: 2, borderRadius: 4 }] },
      options: {
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const val = ctx.parsed;
                const pct = breakdown[ctx.dataIndex] ? (breakdown[ctx.dataIndex].share * 100).toFixed(1) + '%' : '';
                return `  ${ctx.label}: ${new Intl.NumberFormat('en-US').format(val)} tCO₂ (${pct})`;
              }
            },
            backgroundColor: 'rgba(15,31,61,0.95)',
            borderColor: 'rgba(0,212,170,0.3)',
            borderWidth: 1,
            titleColor: '#eef2ff',
            bodyColor: '#8fa3c8',
            padding: 12,
          }
        }
      }
    });
  });
}

/**
 * Stacked bar chart — e.g. production trend or fuel mix
 * @param {string} id
 * @param {string[]} labels - x-axis labels
 * @param {Array} datasets - [{label, data, color}]
 * @param {string} yUnit
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
      borderRadius: 4,
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
          legend: { labels: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font, boxWidth: 10, boxHeight: 10 } },
          tooltip: {
            backgroundColor: 'rgba(15,31,61,0.95)', borderColor: 'rgba(0,212,170,0.25)',
            borderWidth: 1, titleColor: '#eef2ff', bodyColor: '#8fa3c8', padding: 12,
            callbacks: { label: ctx => `  ${ctx.dataset.label}: ${new Intl.NumberFormat('en-US').format(ctx.parsed.y)}${yUnit?' '+yUnit:''}` }
          }
        }
      }
    });
  });
}

/**
 * Multi-line chart — trend over time
 * @param {string} id
 * @param {string[]} labels
 * @param {Array} datasets - [{label, data, color}]
 * @param {string} yUnit
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
        backgroundColor: color.replace(')', ',0.1)').replace('rgb','rgba'),
        borderWidth: 2.5,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: color,
        tension: 0.35,
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
          legend: { labels: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font, boxWidth: 10, boxHeight: 10 } },
          tooltip: {
            backgroundColor: 'rgba(15,31,61,0.95)', borderColor: 'rgba(0,212,170,0.25)',
            borderWidth: 1, titleColor: '#eef2ff', bodyColor: '#8fa3c8', padding: 12,
            callbacks: { label: ctx => `  ${ctx.dataset.label}: ${new Intl.NumberFormat('en-US').format(ctx.parsed.y)}${yUnit?' '+yUnit:''}` }
          }
        }
      }
    });
  });
}

/**
 * Horizontal bar chart — for QA category breakdown
 */
function registerHBarChart(id, labels, data, colors) {
  window._pendingCharts.push(function() {
    destroyChart(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    window._chartInstances[id] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderRadius: 4, borderSkipped: false }]
      },
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
 * Grouped bar chart — fossil vs biogenic fuel energy
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
      borderRadius: 4,
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
          legend: { labels: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font, boxWidth: 10, boxHeight: 10 } },
          tooltip: { backgroundColor: 'rgba(15,31,61,0.95)', borderColor: 'rgba(0,212,170,0.25)', borderWidth: 1,
            titleColor: '#eef2ff', bodyColor: '#8fa3c8', padding: 12 }
        }
      }
    });
  });
}

window.registerDonutChart   = registerDonutChart;
window.registerStackedBarChart = registerStackedBarChart;
window.registerLineChart    = registerLineChart;
window.registerHBarChart    = registerHBarChart;
window.registerGroupedBarChart = registerGroupedBarChart;
window.flushCharts  = flushCharts;
window.destroyChart = destroyChart;
window.CO2_COLORS   = CO2_COLORS;
window.FUEL_COLORS  = FUEL_COLORS;
