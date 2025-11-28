// UI helpers and error reporting
import { state } from './state.js';
import { $ } from './utils.js';

export function initHeader() {
	const input = $('#customTitle');
	const badge = $('#liveTitleBadge');
	const setTitle = (val) => {
		const t = (val || '').trim() || 'Untitled';
		state.title = t;
		badge.textContent = t;
		document.title = `${t} – PBS`;
		// Optionally save to localStorage
		try { localStorage.setItem('EAS_PBS_COMPREHENSIVE_v2', JSON.stringify(state)); } catch (e) {}
	};
	if (state.title && state.title !== 'Untitled') {
		input.value = state.title;
	}
	setTitle(state.title || input.value || 'Untitled');
	const onChange = () => setTitle(input.value);
	input.addEventListener('input', onChange);
	input.addEventListener('change', onChange);
	input.addEventListener('keyup', onChange);
	input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
}

export function showBasicModeNotice() {
	if (document.getElementById('basicModeNotice')) return;
	const wrap = document.querySelector('.wrap');
	const n = document.createElement('div');
	n.id = 'basicModeNotice';
	n.className = 'notice';
	n.innerHTML = `<strong>Trial ended — Basic Mode active.</strong>
		<div class="mini">You can keep using allocations, income, bills, expenses, and reports. Upgrade to unlock Debt Payoff and Savings Goals, or sync with Pro+ Cloud.</div>
		<div class="actions">
			<a class="btn" href="../pro/">Upgrade to Pro</a>
			<a class="btn ghost" href="../pro-cloud/">See Pro+ Cloud</a>
		</div>`;
	wrap.insertBefore(n, wrap.firstChild);
}

export function reportError(err) {
	console.error('PBS runtime error:', err);
	try {
		const wrap = document.querySelector('.wrap');
		if (!wrap) return;
		const n = document.createElement('div');
		n.className = 'notice';
		n.style.border = '1px solid #ff8170';
		const msg = (err && err.message) ? err.message : String(err);
		n.innerHTML = `<strong>Something went wrong.</strong><div class="mini">${msg}</div>`;
		wrap.insertBefore(n, wrap.firstChild);
	} catch (_) {}
}
