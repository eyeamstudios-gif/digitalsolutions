// Main entry point for PBS Starter JS
// Imports modules and initializes app

import { state, initState } from './state.js';
import { renderLegendAndChart } from './chart.js';
import { viewAllocations, viewIncome, viewBills, viewExpenses, viewDebt, viewGoals, viewReport, viewBackup } from './views.js';
import { initHeader, showBasicModeNotice, reportError } from './ui.js';

// ...existing code...

document.addEventListener('DOMContentLoaded', () => {
  try {
    initState();
    initHeader();
    // --- Feature Gating ---
    function applyFeatureGating() {
      // Lock or unlock tabs based on Basic mode
      const locked = isBasicMode();
      const debtTab = document.querySelector('.tab[data-tab="debt"]');
      const goalsTab = document.querySelector('.tab[data-tab="goals"]');
      [debtTab, goalsTab].forEach(btn => {
        if (!btn) return;
        if (locked) { btn.classList.add('locked'); }
        else { btn.classList.remove('locked'); }
      });
    }

    // --- Routing ---
    function route() {
      var activeEl = document.querySelector('.tab.active');
      var active = (activeEl && activeEl.dataset && activeEl.dataset.tab) ? activeEl.dataset.tab : 'allocations';
      if (isBasicMode() && (active === 'debt' || active === 'goals')) {
        active = 'allocations';
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        document.querySelector('.tab[data-tab="allocations"]').classList.add('active');
      }
      if (active === 'allocations') viewAllocations();
      if (active === 'income') viewIncome();
      if (active === 'bills') viewBills();
      if (active === 'expenses') viewExpenses();
      if (active === 'debt') viewDebt();
      if (active === 'goals') viewGoals();
      if (active === 'report') viewReport();
      if (active === 'backup') viewBackup();
    }

    // --- Main App Initialization ---
    document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
      if (t.classList.contains('locked')) { showBasicModeNotice(); return; }
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      route();
      renderLegendAndChart();
    });
    applyFeatureGating();
    route();
    renderLegendAndChart();
  } catch (e) {
    reportError(e);
  }
});
