// ...existing code...

	$('#exportJson').onclick = () => { $('#jsonArea').value = JSON.stringify(state, null, 2); };
	$('#exportPbs').onclick = () => {
		try {
			const data = JSON.stringify(state);
			const blob = new Blob([data], { type: 'application/json' });
			const a = document.createElement('a');
			const title = (state.title || 'PBS').replace(/[^a-z0-9\-_]+/gi, '_');
			const stamp = new Date().toISOString().slice(0, 10);
			a.href = URL.createObjectURL(blob);
			a.download = `${title}_${stamp}.pbs`;
			document.body.appendChild(a); a.click(); a.remove();
		} catch (e) { alert('Export failed'); }
	};
	$('#importJson').onclick = () => {
		try {
			const data = JSON.parse($('#jsonArea').value); Object.assign(state, data); /* saveLocal(); */ route(); renderLegendAndChart(); alert('Imported ✓');
		} catch (e) { alert('Invalid JSON'); }
	};
	$('#clearAll').onclick = () => {
		if (confirm('Erase all saved data?')) {
			try {
				localStorage.removeItem(LS_KEY);
				(typeof LEGACY_KEYS !== 'undefined' && LEGACY_KEYS || []).forEach(k => localStorage.removeItem(k));
			} catch (e) { /* ignore */ }
			location.reload();
		}
	};
	$('#importFileBtn').onclick = () => $('#importFile').click();
	$('#importFile').addEventListener('change', (e) => {
		const file = (e.target && e.target.files && e.target.files[0]) || null; if (!file) return; const reader = new FileReader();
		reader.onload = () => { try { const data = JSON.parse(reader.result); Object.assign(state, data); /* saveLocal(); */ route(); renderLegendAndChart(); alert('Imported ✓ from file'); } catch (err) { alert('Invalid file'); } };
		reader.readAsText(file);
	});
// ...existing code...
export function viewReport() {
	const left = $('#left');
	left.classList.remove('locked');
	left.querySelectorAll('.feature-lock-overlay').forEach(o => o.remove());
	const monthlyIncome = state.income.reduce((t, i) => t + incomeToMonthly(i.amount, i.freq), 0);
	const monthlyBills = state.bills.reduce((t, b) => t + incomeToMonthly(b.amount, b.freq), 0);
	const monthlyVar = state.expenses.reduce((t, x) => t + incomeToMonthly(x.amount, x.freq), 0);
	// Monthly debt payments (minimums + extra). Preview-gated until rollout.
	const monthlyDebt = state.debts.reduce((t, d) => {
		return t + incomeToMonthly(d.min + d.extra, d.freq);
	}, 0);
	// ...other report logic...
}
export function viewDebt() {
	const left = $('#left');
	left.classList.remove('locked');
	left.querySelectorAll('.feature-lock-overlay').forEach(o => o.remove());
	// Lock for Basic mode
	if (typeof isBasicMode === 'function' && isBasicMode()) {
		left.innerHTML = `
			<h2>Debt Payoff</h2>
			<div class="card" style="background:#0f2132;border:1px dashed rgba(255,255,255,.15)">
				<div class="row" style="align-items:center;justify-content:space-between">
					<div>
						<div style="font-weight:700;margin-bottom:4px">Locked in Basic Mode</div>
						<div class="mini">Upgrade to Pro to enable Debt Payoff tracking and strategies.</div>
					</div>
					<a class="btn" href="../pro/">Upgrade</a>
				</div>
			</div>`;
		return;
	}
	left.innerHTML =
		`<h2>Debt Payoff</h2>
		<div class="row" style="margin-bottom:10px">
			<div><label>Name</label><input id="dbName" placeholder="e.g., Credit Card A"/></div>
			<div><label>Balance</label><input id="dbBal" type="number" min="0" step="0.01" placeholder="e.g., 2500"/></div>
			<div><label>APR %</label><input id="dbApr" type="number" min="0" step="0.01" placeholder="e.g., 19.99"/></div>
		</div>
		<div class="row" style="margin-bottom:10px">
			<div><label>Min Payment</label><input id="dbMin" type="number" min="0" step="0.01" placeholder="e.g., 75"/></div>
			<div><label>Extra Monthly</label><input id="dbExtra" type="number" min="0" step="0.01" placeholder="e.g., 100"/></div>
			<div>
				<label>Strategy</label>
				<select id="dbStrategy"><option value="snowball">Snowball (lowest balance first)</option><option value="avalanche">Avalanche (highest APR first)</option></select>
			</div>
		</div>
		<div class="row">
			<button class="btn primary" id="addDebt">Add Debt</button>
			<button class="btn success" id="updateDebt" style="display:none">Update Debt</button>
			<button class="btn ghost" id="cancelDebtEdit" style="display:none">Cancel</button>
		</div>
		<div class="hr"></div>
		<table>
			<thead><tr><th>Name</th><th>Balance</th><th>APR</th><th>Min</th><th>Extra</th><th class="right">Months (est)</th><th></th></tr></thead>
			<tbody id="dbTbody"></tbody>
		</table>
		<div class="hr"></div>
		<div class="pill">Total Extra Toward Debt: <strong id="dbExtraTotal" style="margin-left:6px">$0</strong></div>`;

	let editingId = null;

	function resetDebtForm() {
		$('#dbName').value = '';
		$('#dbBal').value = '';
		$('#dbApr').value = '';
		$('#dbMin').value = '';
		$('#dbExtra').value = '';
		$('#addDebt').style.display = 'inline-flex';
		$('#updateDebt').style.display = 'none';
		$('#cancelDebtEdit').style.display = 'none';
		editingId = null;
		$('#dbName').focus();
	}

	$('#addDebt').onclick = () => {
		const name = ($('#dbName').value || '').trim() || 'New Debt';
		const balRaw = parseFloat($('#dbBal').value);
		const aprRaw = parseFloat($('#dbApr').value);
		const minRaw = parseFloat($('#dbMin').value);
		const extraRaw = parseFloat($('#dbExtra').value);
		const balance = Math.max(0, isNaN(balRaw) ? 0 : balRaw);
		const apr = Math.min(100, Math.max(0, isNaN(aprRaw) ? 0 : aprRaw));
		const min = Math.max(0, isNaN(minRaw) ? 0 : minRaw);
		const extra = Math.max(0, isNaN(extraRaw) ? 0 : extraRaw);
		state.debts.push({ id: uuid(), name, balance, apr, min, extra });
		// saveLocal();
		resetDebtForm();
		viewDebt();
	};

	$('#dbStrategy').value = state.debtStrategy;

	$('#updateDebt').onclick = () => {
		const nameRaw = $('#dbName').value;
		const balRaw = parseFloat($('#dbBal').value);
		const aprRaw = parseFloat($('#dbApr').value);
		const minRaw = parseFloat($('#dbMin').value);
		const extraRaw = parseFloat($('#dbExtra').value);
		const name = (nameRaw || '').trim() || 'New Debt';
		const balance = Math.max(0, isNaN(balRaw) ? 0 : balRaw);
		const apr = Math.min(100, Math.max(0, isNaN(aprRaw) ? 0 : aprRaw));
		const min = Math.max(0, isNaN(minRaw) ? 0 : minRaw);
		const extra = Math.max(0, isNaN(extraRaw) ? 0 : extraRaw);
		const item = state.debts.find(d => d.id === editingId);
		if (item) {
			item.name = name;
			item.balance = balance;
			item.apr = apr;
			item.min = min;
			item.extra = extra;
			// saveLocal();
			resetDebtForm();
			viewDebt();
		}
	};

	$('#cancelDebtEdit').onclick = resetDebtForm;

	$('#dbStrategy').onchange = () => {
		state.debtStrategy = $('#dbStrategy').value;
		// saveLocal();
		viewDebt();
	};

	const body = $('#dbTbody'); body.innerHTML = '';
	const ordered = [...state.debts].sort((a, b) => state.debtStrategy === 'snowball' ? (a.balance - b.balance) : (b.apr - a.apr));
	ordered.forEach(d => {
		const months = estimateMonthsToPayoff(d.balance, d.apr, d.min + d.extra);
		const tr = document.createElement('tr');
		tr.innerHTML = `<td data-label="Name">${d.name}</td><td data-label="Balance">${fmt(d.balance)}</td><td data-label="APR" class="mini">${Number(d.apr || 0).toFixed(2)}%</td><td data-label="Min">${fmt(d.min || 0)}</td><td data-label="Extra">${fmt(d.extra || 0)}</td><td data-label="Months" class="right">${months === Infinity ? '–' : months}</td><td data-label="" class="right"><button class="btn ghost" data-id="${d.id}" data-action="edit">Edit</button> <button class="btn ghost" data-id="${d.id}" data-action="delete">Delete</button></td>`;
		body.appendChild(tr);
	});

	body.querySelectorAll('button').forEach(btn => {
		if (btn.dataset.action === 'delete') {
			btn.onclick = () => {
				state.debts = state.debts.filter(i => i.id !== btn.dataset.id);
				// saveLocal();
				resetDebtForm();
				viewDebt();
			};
		} else if (btn.dataset.action === 'edit') {
			btn.onclick = () => {
				const item = state.debts.find(d => d.id === btn.dataset.id);
				if (item) {
					$('#dbName').value = item.name;
					$('#dbBal').value = item.balance;
					$('#dbApr').value = item.apr || '';
					$('#dbMin').value = item.min || '';
					$('#dbExtra').value = item.extra || '';
					$('#addDebt').style.display = 'none';
					$('#updateDebt').style.display = 'inline-flex';
					$('#cancelDebtEdit').style.display = 'inline-flex';
					editingId = item.id;
				}
			};
		}
	});
	$('#dbExtraTotal').textContent = fmt(state.debts.reduce((t, d) => t + (d.extra || 0), 0));
}

// Simple amortization estimate (months) using iterative reduction.
function estimateMonthsToPayoff(balance, apr, payment) {
	balance = parseFloat(balance || 0); const r = (apr || 0) / 100 / 12; payment = parseFloat(payment || 0);
	if (balance <= 0) return 0; if (payment <= balance * r) return Infinity; // payment too small
	let months = 0; let cap = 1200; // cap safety
	while (balance > 0 && months < cap) { balance = balance * (1 + r) - payment; months++; }
	return months >= cap ? Infinity : months;
}
// ...existing code...
export function viewExpenses() {
	const left = $('#left');
	left.classList.remove('locked');
	left.querySelectorAll('.feature-lock-overlay').forEach(o => o.remove());
	left.innerHTML =
		`<h2>Variable Expenses</h2>
		<div class="row" style="margin-bottom:10px">
			<div><label>Name</label><input id="exName" placeholder="e.g., Groceries"/></div>
			<div><label>Budget / Amount</label><input id="exAmt" type="number" min="0" step="0.01" placeholder="e.g., 400"/></div>
			<div><label>Frequency</label>
				<select id="exFreq"><option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="biweekly">Bi-Weekly</option><option value="annual">Annual</option></select>
			</div>
		</div>
		<div class="row" style="margin-bottom:10px">
			<div><label>Bucket</label>
				<select id="exBucket"><option value="essentials">Essentials</option><option value="security">Security</option><option value="lifestyle">Lifestyle</option><option value="future">Future</option><option value="giving">Giving</option></select>
			</div>
			<div><label>Notes</label><input id="exNotes" placeholder="optional"/></div>
		</div>
		<div class="row">
			<button class="btn primary" id="addEx">Add Expense</button>
			<button class="btn success" id="updateEx" style="display:none">Update Expense</button>
			<button class="btn ghost" id="cancelExEdit" style="display:none">Cancel</button>
		</div>
		<div class="hr"></div>
		<table>
			<thead><tr><th>Name</th><th>Bucket</th><th>Amount</th><th>Freq</th><th class="right">Monthly</th><th></th></tr></thead>
			<tbody id="exTbody"></tbody>
		</table>
		<div class="hr"></div>
		<div class="pill">Monthly Variable Total: <strong id="exTotal" style="margin-left:6px">$0</strong></div>`;

	let editingId = null;

	function resetExpenseForm() {
		$('#exName').value = '';
		$('#exAmt').value = '';
		$('#exFreq').value = 'monthly';
		$('#exBucket').value = 'essentials';
		$('#exNotes').value = '';
		$('#addEx').style.display = 'inline-flex';
		$('#updateEx').style.display = 'none';
		$('#cancelExEdit').style.display = 'none';
		editingId = null;
		$('#exName').focus();
	}

	$('#addEx').onclick = () => {
		const name = ($('#exName').value || '').trim() || 'New Expense';
		const amt = parseFloat($('#exAmt').value);
		const amount = Math.max(0, isNaN(amt) ? 0 : amt);
		const freq = $('#exFreq').value || 'monthly';
		const bucket = $('#exBucket').value || 'essentials';
		const notes = ($('#exNotes').value || '').trim();
		state.expenses.push({ id: uuid(), name, amount, freq, bucket, notes });
		// saveLocal();
		resetExpenseForm();
		viewExpenses();
		// renderReport();
	};

	$('#updateEx').onclick = () => {
		const nameRaw = $('#exName').value;
		const amtRaw = parseFloat($('#exAmt').value);
		const freq = $('#exFreq').value || 'monthly';
		const bucket = $('#exBucket').value || 'essentials';
		const notes = ($('#exNotes').value || '').trim();
		const name = (nameRaw || '').trim() || 'New Expense';
		const amount = Math.max(0, isNaN(amtRaw) ? 0 : amtRaw);
		const item = state.expenses.find(x => x.id === editingId);
		if (item) {
			item.name = name;
			item.amount = amount;
			item.freq = freq;
			item.bucket = bucket;
			item.notes = notes;
			// saveLocal();
			resetExpenseForm();
			viewExpenses();
			// renderReport();
		}
	};

	$('#cancelExEdit').onclick = resetExpenseForm;

	const body = $('#exTbody'); body.innerHTML = '';
	state.expenses.forEach(x => {
		const tr = document.createElement('tr');
		tr.innerHTML = `<td data-label="Name">${x.name}${x.notes ? `<div class='mini'>${x.notes}</div>` : ''}</td><td data-label="Bucket" class="mini">${x.bucket}</td><td data-label="Amount">${fmt(x.amount)}</td><td data-label="Freq" class="mini">${x.freq}</td><td data-label="Monthly" class="right">${fmt(incomeToMonthly(x.amount, x.freq))}</td><td data-label="" class="right"><button class="btn ghost" data-id="${x.id}" data-action="edit">Edit</button> <button class="btn ghost" data-id="${x.id}" data-action="delete">Delete</button></td>`;
		body.appendChild(tr);
	});

	body.querySelectorAll('button').forEach(btn => {
		if (btn.dataset.action === 'delete') {
			btn.onclick = () => {
				state.expenses = state.expenses.filter(i => i.id !== btn.dataset.id);
				// saveLocal();
				resetExpenseForm();
				viewExpenses();
				// renderReport();
			};
		} else if (btn.dataset.action === 'edit') {
			btn.onclick = () => {
				const item = state.expenses.find(x => x.id === btn.dataset.id);
				if (item) {
					$('#exName').value = item.name;
					$('#exAmt').value = item.amount;
					$('#exFreq').value = item.freq;
					$('#exBucket').value = item.bucket;
					$('#exNotes').value = item.notes || '';
					$('#addEx').style.display = 'none';
					$('#updateEx').style.display = 'inline-flex';
					$('#cancelExEdit').style.display = 'inline-flex';
					editingId = item.id;
				}
			};
		}
	});
	$('#exTotal').textContent = fmt(state.expenses.reduce((t, x) => t + incomeToMonthly(x.amount, x.freq), 0));
}
// View rendering functions for each tab
import { renderLegendAndChart } from './chart.js';
const BUCKETS = [
	{ key: 'essentials', label: 'Essentials (Housing, Utilities, Food, Transport)' },
	{ key: 'security', label: 'Financial Security (Debt, Emergency, Retirement)' },
	{ key: 'lifestyle', label: 'Lifestyle & Growth (Health, Learning, Hobbies)' },
	{ key: 'future', label: 'Freedom / Future Fund (Investments, Big Goals)' },
	{ key: 'giving', label: 'Community / Giving (Donations, Tithes)' }
];
const PRESETS = {
	starter: { essentials: 60, security: 25, lifestyle: 15, future: 0, giving: 0 },
	growth: { essentials: 55, security: 20, lifestyle: 15, future: 5, giving: 5 },
	legacy: { essentials: 50, security: 20, lifestyle: 15, future: 10, giving: 5 }
};
const DEFAULT_BUCKET_LABELS = Object.fromEntries(BUCKETS.map(b => [b.key, b.label]));
const normalized = obj => {
	const total = Object.values(obj).reduce((t, v) => t + (parseFloat(v) || 0), 0);
	if (total === 0) return obj;
	const out = {};
	for (const k in obj) { out[k] = (obj[k] / total) * 100; }
	return out;
};
const L = key => (state.bucketLabels && state.bucketLabels[key]) || BUCKETS.find(b => b.key === key)?.label || key;

export function viewAllocations() {
	const left = $('#left');
	left.classList.remove('locked');
	left.querySelectorAll('.feature-lock-overlay').forEach(o => o.remove());
	const monthlyIncome = state.income.reduce((t, i) => t + (parseFloat(i.amount) || 0), 0);
	left.innerHTML =
		`<h2>Allocations (Targets)</h2>
		<div class="row" style="margin-bottom:10px">
			<div>
				<label for="plan">Plan Presets</label>
				<select id="plan">
					<option value="starter">Starter – 60/25/15/0/0</option>
					<option value="growth">Growth – 55/20/15/5/5</option>
					<option value="legacy">Legacy – 50/20/15/10/5</option>
					<option value="custom">Custom</option>
				</select>
			</div>
			<div class="row" style="flex:1">
				<button class="btn primary" id="applyPreset">Apply Preset</button>
				<button class="btn ghost" id="rebalance">Rebalance to 100%</button>
			</div>
		</div>
		<div class="pill">Monthly Income (from sources): <strong style="margin-left:6px">${fmt(monthlyIncome)}</strong></div>
		<div class="hr"></div>
		<div id="allocRows"></div>
		<div class="hr"></div>
		<div class="row">
			<button class="btn success" id="saveAll">Save</button>
			<button class="btn danger" id="resetAll">Reset</button>
		</div>`;

	$('#plan').value = state.plan;
	const wrap = $('#allocRows'); wrap.innerHTML = '';
	BUCKETS.forEach(b => {
		const pct = clamp(Number(state.allocations[b.key] || 0), 0, 100);
		const row = document.createElement('div'); row.className = 'alloc';
		row.innerHTML =
			`<div>
				<div class="name" style="margin-bottom:6px">Bucket Name</div>
				<input class="bucketLabel" type="text" value="${L(b.key)}" data-key="${b.key}" />
			</div>
			<div>
				<label>Percent Slider</label>
				<input class="slider" type="range" min="0" max="100" step="1" value="${pct}" data-key="${b.key}"/>
			</div>
			<div>
				<label>%</label>
				<input class="percent" type="number" min="0" max="100" step="1" value="${pct}" data-key="${b.key}">
			</div>
			<div>
				<label>Amount</label>
				<div class="amount">${fmt(monthlyIncome * (pct / 100))}</div>
			</div>`;
		wrap.appendChild(row);
	});

	wrap.querySelectorAll('.bucketLabel').forEach(el => {
		el.addEventListener('input', e => {
			const key = e.target.dataset.key;
			state.bucketLabels[key] = e.target.value || L(key);
			// saveLocal();
			renderLegendAndChart();
			// updateBucketSelects();
		});
	});
	wrap.querySelectorAll('.slider,.percent').forEach(el => {
		el.addEventListener('input', e => {
			const key = e.target.dataset.key;
			const val = clamp(parseFloat(e.target.value || 0), 0, 100);
			state.allocations[key] = val;
			state.plan = 'custom';
			$('#plan').value = 'custom';
			renderLegendAndChart();
			viewAllocations();
			// saveLocal();
		});
	});
	$('#applyPreset').onclick = () => {
		const p = $('#plan').value;
		if (PRESETS[p]) {
			state.plan = p;
			state.allocations = { ...PRESETS[p] };
			// saveLocal();
			viewAllocations();
			renderLegendAndChart();
		}
	};
	$('#rebalance').onclick = () => {
		state.allocations = normalized(state.allocations);
		let entries = Object.entries(state.allocations).map(([k, v]) => [k, Math.floor(v)]);
		let s = entries.reduce((t, [, v]) => t + v, 0);
		let r = 100 - s, i = 0;
		while (r > 0) { entries[i % entries.length][1] += 1; r--; i++; }
		state.allocations = Object.fromEntries(entries);
		// saveLocal();
		viewAllocations();
		renderLegendAndChart();
	};
	$('#saveAll').onclick = () => {
		// saveLocal();
		// flash('#saveAll','Saved ✓');
	};
	$('#resetAll').onclick = () => {
		if (confirm('Reset allocations & names to defaults?')) {
			state.allocations = { ...PRESETS.growth };
			state.bucketLabels = { ...DEFAULT_BUCKET_LABELS };
			state.plan = 'growth';
			// saveLocal();
			viewAllocations();
			renderLegendAndChart();
			// updateBucketSelects();
		}
	};
}

export function viewIncome() {
	const left = $('#left');
	left.classList.remove('locked');
	left.querySelectorAll('.feature-lock-overlay').forEach(o => o.remove());
	left.innerHTML =
		`<h2>Income Sources</h2>
		<div class="row" style="margin-bottom:10px">
			<div><label>Name</label><input id="incName" placeholder="e.g., Paycheck"/></div>
			<div><label>Amount</label><input id="incAmt" type="number" min="0" step="0.01" placeholder="e.g., 3000"/></div>
			<div><label>Frequency</label>
				<select id="incFreq"><option value="monthly">Monthly</option><option value="biweekly">Bi-Weekly</option><option value="weekly">Weekly</option><option value="annual">Annual</option></select>
			</div>
		</div>
		<div class="row">
			<button class="btn primary" id="addIncome">Add Source</button>
			<button class="btn success" id="updateIncome" style="display:none">Update Source</button>
			<button class="btn ghost" id="cancelIncomeEdit" style="display:none">Cancel</button>
		</div>
		<div class="hr"></div>
		<table>
			<thead><tr><th>Name</th><th>Amount</th><th>Freq</th><th class="right">Monthly</th><th></th></tr></thead>
			<tbody id="incTbody"></tbody>
		</table>
		<div class="hr"></div>
		<div class="pill">Total Monthly Income: <strong id="incTotal" style="margin-left:6px">$0</strong></div>`;

	let editingId = null;

	function incomeToMonthly(amount, freq) {
		const a = parseFloat(amount || 0);
		const factors = { monthly: 1, biweekly: 26 / 12, weekly: 52 / 12, annual: 1 / 12 };
		const f = factors.hasOwnProperty(freq) ? factors[freq] : 1;
		return a * f;
	}


	// ...existing code...
			b.onclick = () => {
				const item = state.income.find(i => i.id === b.dataset.id);
				if (item) {
					$('#incName').value = item.name;
					$('#incAmt').value = item.amount;
					$('#incFreq').value = item.freq;
					$('#addIncome').style.display = 'none';
					$('#updateIncome').style.display = 'inline-flex';
					$('#cancelIncomeEdit').style.display = 'inline-flex';
					editingId = item.id;
				}
			};
		}
	});
	$('#incTotal').textContent = fmt(state.income.reduce((t, i) => t + incomeToMonthly(i.amount, i.freq), 0));
}

// ...existing code...
								<option value="4">4</option>
								<option value="5">5</option>
								<option value="6">6</option>
								<option value="7">7</option>
								<option value="8">8</option>
								<option value="9">9</option>
								<option value="10">10</option>
								<option value="11">11</option>
								<option value="12">12</option>
								<option value="13">13</option>
								<option value="14">14</option>
								<option value="15">15</option>
								<option value="16">16</option>
								<option value="17">17</option>
								<option value="18">18</option>
								<option value="19">19</option>
								<option value="20">20</option>
								<option value="21">21</option>
								<option value="22">22</option>
								<option value="23">23</option>
								<option value="24">24</option>
								<option value="25">25</option>
								<option value="26">26</option>
								<option value="27">27</option>
								<option value="28">28</option>
								<option value="29">29</option>
								<option value="30">30</option>
								<option value="31">31</option>
							</select>
						</div>
			<div><label>Bucket</label>
				<select id="billBucket"><option value="essentials">Essentials</option><option value="security">Security</option><option value="lifestyle">Lifestyle</option><option value="future">Future</option><option value="giving">Giving</option></select>
			</div>
			<div><label>Notes</label><input id="billNotes" placeholder="optional"/></div>
		</div>
		<div class="row">
			<button class="btn primary" id="addBill">Add Bill</button>
			<button class="btn success" id="updateBill" style="display:none">Update Bill</button>
			<button class="btn ghost" id="cancelBillEdit" style="display:none">Cancel</button>
		</div>
		<div class="hr"></div>
		<table>
			<thead><tr><th>Name</th><th>Bucket</th><th>Amount</th><th>Freq</th><th class="right">Monthly</th><th>Due</th><th></th></tr></thead>
			<tbody id="billTbody"></tbody>
		</table>
		<div class="hr"></div>
		<div class="pill">Monthly Bills Total: <strong id="billTotal" style="margin-left:6px">$0</strong></div>`;
		$('#addBill').style.display = 'inline-flex';
		$('#updateBill').style.display = 'none';
		$('#cancelBillEdit').style.display = 'none';
		editingId = null;
		$('#billName').focus();
	}

	$('#addBill').onclick = () => {
		const name = ($('#billName').value || '').trim() || 'New Bill';
		const amt = parseFloat($('#billAmt').value);
		const amount = isNaN(amt) ? 0 : amt;
		const freq = $('#billFreq').value || 'monthly';
		const due = parseInt($('#billDue').value || '');
		const bucket = $('#billBucket').value || 'essentials';
		const notes = ($('#billNotes').value || '').trim();
		state.bills.push({ id: uuid(), name, amount, freq, dueDay: isNaN(due) ? null : due, bucket, notes });
		// saveLocal();
		resetBillForm();
		viewBills();
		// renderReport();
	};

	$('#updateBill').onclick = () => {
		const nameRaw = $('#billName').value;
		const amtRaw = parseFloat($('#billAmt').value);
		const freq = $('#billFreq').value || 'monthly';
		const due = parseInt($('#billDue').value || '');
		const bucket = $('#billBucket').value || 'essentials';
		const notes = ($('#billNotes').value || '').trim();
		const name = (nameRaw || '').trim() || 'New Bill';
		const amount = isNaN(amtRaw) ? 0 : amtRaw;
		const item = state.bills.find(b => b.id === editingId);
		if (item) {
			item.name = name;
			item.amount = amount;
			item.freq = freq;
			item.dueDay = isNaN(due) ? null : due;
			item.bucket = bucket;
			item.notes = notes;
			// saveLocal();
			resetBillForm();
			viewBills();
			// renderReport();
		}
	};

	$('#cancelBillEdit').onclick = resetBillForm;

	const body = $('#billTbody'); body.innerHTML = '';
	state.bills.forEach(b => {
		const tr = document.createElement('tr');
		tr.innerHTML = `<td data-label="Name">${b.name}${b.notes ? `<div class='mini'>${b.notes}</div>` : ''}</td><td data-label="Bucket" class="mini">${b.bucket}</td><td data-label="Amount">${fmt(b.amount)}</td><td data-label="Freq" class="mini">${b.freq}</td><td data-label="Monthly" class="right">${fmt(incomeToMonthly(b.amount, b.freq))}</td><td data-label="Due" class="mini">${b.dueDay == null ? '' : b.dueDay}</td><td data-label="" class="right"><button class="btn ghost" data-id="${b.id}" data-action="edit">Edit</button> <button class="btn ghost" data-id="${b.id}" data-action="delete">Delete</button></td>`;
		body.appendChild(tr);
	});

	body.querySelectorAll('button').forEach(btn => {
		if (btn.dataset.action === 'delete') {
			btn.onclick = () => {
				state.bills = state.bills.filter(x => x.id !== btn.dataset.id);
				// saveLocal();
				resetBillForm();
				viewBills();
				// renderReport();
			};
		} else if (btn.dataset.action === 'edit') {
			btn.onclick = () => {
				const item = state.bills.find(b => b.id === btn.dataset.id);
				if (item) {
					$('#billName').value = item.name;
					$('#billAmt').value = item.amount;
					$('#billFreq').value = item.freq;
					$('#billDue').value = item.dueDay || '';
					$('#billBucket').value = item.bucket;
					$('#billNotes').value = item.notes || '';
					$('#addBill').style.display = 'none';
					$('#updateBill').style.display = 'inline-flex';
					$('#cancelBillEdit').style.display = 'inline-flex';
					editingId = item.id;
				}
			};
		}
	});
	$('#billTotal').textContent = fmt(state.bills.reduce((t, b) => t + incomeToMonthly(b.amount, b.freq), 0));
}
		$('#exBucket').value = 'essentials';
		$('#exNotes').value = '';
		$('#addEx').style.display = 'inline-flex';
		$('#updateEx').style.display = 'none';
		$('#cancelExEdit').style.display = 'none';
		editingId = null;
		$('#exName').focus();
	}

	$('#addEx').onclick = () => {
		const name = ($('#exName').value || '').trim() || 'New Expense';
		const amt = parseFloat($('#exAmt').value);
		const amount = clamp(isNaN(amt) ? 0 : amt, 0, Infinity);
		const freq = $('#exFreq').value || 'monthly';
		const bucket = $('#exBucket').value || 'essentials';
		const notes = ($('#exNotes').value || '').trim();
		state.expenses.push({ id: uuid(), name, amount, freq, bucket, notes });
		// saveLocal();
		resetExpenseForm();
		viewExpenses();
		// renderReport();
	};

	$('#updateEx').onclick = () => {
		const nameRaw = $('#exName').value;
		const amtRaw = parseFloat($('#exAmt').value);
		const freq = $('#exFreq').value || 'monthly';
		const bucket = $('#exBucket').value || 'essentials';
		const notes = ($('#exNotes').value || '').trim();
		const name = (nameRaw || '').trim() || 'New Expense';
		const amount = clamp(isNaN(amtRaw) ? 0 : amtRaw, 0, Infinity);
		const item = state.expenses.find(x => x.id === editingId);
		if (item) {
			item.name = name;
			item.amount = amount;
			item.freq = freq;
			item.bucket = bucket;
			item.notes = notes;
			// saveLocal();
			resetExpenseForm();
			viewExpenses();
			// renderReport();
		}
	};

	$('#cancelExEdit').onclick = resetExpenseForm;

	const body = $('#exTbody'); body.innerHTML = '';
	state.expenses.forEach(x => {
		const tr = document.createElement('tr');
		tr.innerHTML = `<td data-label="Name">${x.name}${x.notes ? `<div class='mini'>${x.notes}</div>` : ''}</td><td data-label="Bucket" class="mini">${x.bucket}</td><td data-label="Amount">${fmt(x.amount)}</td><td data-label="Freq" class="mini">${x.freq}</td><td data-label="Monthly" class="right">${fmt(incomeToMonthly(x.amount, x.freq))}</td><td data-label="" class="right"><button class="btn ghost" data-id="${x.id}" data-action="edit">Edit</button> <button class="btn ghost" data-id="${x.id}" data-action="delete">Delete</button></td>`;
		body.appendChild(tr);
	});

	body.querySelectorAll('button').forEach(btn => {
		if (btn.dataset.action === 'delete') {
			btn.onclick = () => {
				state.expenses = state.expenses.filter(i => i.id !== btn.dataset.id);
				// saveLocal();
				resetExpenseForm();
				viewExpenses();
				// renderReport();
			};
		} else if (btn.dataset.action === 'edit') {
			btn.onclick = () => {
				const item = state.expenses.find(x => x.id === btn.dataset.id);
				if (item) {
					$('#exName').value = item.name;
					$('#exAmt').value = item.amount;
					$('#exFreq').value = item.freq;
					$('#exBucket').value = item.bucket;
					$('#exNotes').value = item.notes || '';
					$('#addEx').style.display = 'none';
					$('#updateEx').style.display = 'inline-flex';
					$('#cancelExEdit').style.display = 'inline-flex';
					editingId = item.id;
				}
			};
		}
	});
	$('#exTotal').textContent = fmt(state.expenses.reduce((t, x) => t + incomeToMonthly(x.amount, x.freq), 0));
}
export function viewDebt() {
	var left = $('#left');
	left.classList.remove('locked');
	left.querySelectorAll('.feature-lock-overlay').forEach(o => o.remove());
	left.innerHTML =
		`<h2>Debt Payoff</h2>
		<div class="row" style="margin-bottom:10px">
			<div><label>Name</label><input id="dbName" placeholder="e.g., Credit Card A"/></div>
			<div><label>Balance</label><input id="dbBal" type="number" min="0" step="0.01" placeholder="e.g., 2500"/></div>
			<div><label>APR %</label><input id="dbApr" type="number" min="0" step="0.01" placeholder="e.g., 19.99"/></div>
		</div>
		<div class="row" style="margin-bottom:10px">
			<div><label>Min Payment</label><input id="dbMin" type="number" min="0" step="0.01" placeholder="e.g., 75"/></div>
			<div><label>Extra Monthly</label><input id="dbExtra" type="number" min="0" step="0.01" placeholder="e.g., 100"/></div>
			<div>
				<label>Strategy</label>
				<select id="dbStrategy"><option value="snowball">Snowball (lowest balance first)</option><option value="avalanche">Avalanche (highest APR first)</option></select>
			</div>
		</div>
		<div class="row">
			<button class="btn primary" id="addDebt">Add Debt</button>
			<button class="btn success" id="updateDebt" style="display:none">Update Debt</button>
			<button class="btn ghost" id="cancelDebtEdit" style="display:none">Cancel</button>
		</div>
		<div class="hr"></div>
		<table>
			<thead><tr><th>Name</th><th>Balance</th><th>APR</th><th>Min</th><th>Extra</th><th class="right">Months (est)</th><th></th></tr></thead>
			<tbody id="dbTbody"></tbody>
		</table>
		<div class="hr"></div>
		<div class="pill">Total Extra Toward Debt: <strong id="dbExtraTotal" style="margin-left:6px">$0</strong></div>`;

	let editingId = null;

	function estimateMonthsToPayoff(balance, apr, payment) {
		balance = parseFloat(balance || 0); const r = (apr || 0) / 100 / 12; payment = parseFloat(payment || 0);
		if (balance <= 0) return 0; if (payment <= balance * r) return Infinity;
		let months = 0; let cap = 1200;
		while (balance > 0 && months < cap) { balance = balance * (1 + r) - payment; months++; }
		return months >= cap ? Infinity : months;
	}

	function resetDebtForm() {
		$('#dbName').value = '';
		$('#dbBal').value = '';
		$('#dbApr').value = '';
		$('#dbMin').value = '';
		$('#dbExtra').value = '';
		$('#addDebt').style.display = 'inline-flex';
		$('#updateDebt').style.display = 'none';
		$('#cancelDebtEdit').style.display = 'none';
		editingId = null;
		$('#dbName').focus();
	}

	$('#addDebt').onclick = () => {
		const name = ($('#dbName').value || '').trim() || 'New Debt';
		const balRaw = parseFloat($('#dbBal').value);
		const aprRaw = parseFloat($('#dbApr').value);
		const minRaw = parseFloat($('#dbMin').value);
		const extraRaw = parseFloat($('#dbExtra').value);
		const balance = clamp(isNaN(balRaw) ? 0 : balRaw, 0, Infinity);
		const apr = clamp(isNaN(aprRaw) ? 0 : aprRaw, 0, 100);
		const min = clamp(isNaN(minRaw) ? 0 : minRaw, 0, Infinity);
		const extra = clamp(isNaN(extraRaw) ? 0 : extraRaw, 0, Infinity);
		state.debts.push({ id: uuid(), name, balance, apr, min, extra });
		// saveLocal();
		resetDebtForm();
		viewDebt();
	};

	$('#dbStrategy').value = state.debtStrategy;

	$('#updateDebt').onclick = () => {
		const nameRaw = $('#dbName').value;
		const balRaw = parseFloat($('#dbBal').value);
		const aprRaw = parseFloat($('#dbApr').value);
		const minRaw = parseFloat($('#dbMin').value);
		const extraRaw = parseFloat($('#dbExtra').value);
		const name = (nameRaw || '').trim() || 'New Debt';
		const balance = clamp(isNaN(balRaw) ? 0 : balRaw, 0, Infinity);
		const apr = clamp(isNaN(aprRaw) ? 0 : aprRaw, 0, 100);
		const min = clamp(isNaN(minRaw) ? 0 : minRaw, 0, Infinity);
		const extra = clamp(isNaN(extraRaw) ? 0 : extraRaw, 0, Infinity);
		const item = state.debts.find(d => d.id === editingId);
		if (item) {
			item.name = name;
			item.balance = balance;
			item.apr = apr;
			item.min = min;
			item.extra = extra;
			// saveLocal();
			resetDebtForm();
			viewDebt();
		}
	};

	$('#cancelDebtEdit').onclick = resetDebtForm;

	$('#dbStrategy').onchange = () => { state.debtStrategy = $('#dbStrategy').value; /* saveLocal(); */ viewDebt(); };

	const body = $('#dbTbody'); body.innerHTML = '';
	const ordered = [...state.debts].sort((a, b) => state.debtStrategy === 'snowball' ? (a.balance - b.balance) : (b.apr - a.apr));
	ordered.forEach(d => {
		const months = estimateMonthsToPayoff(d.balance, d.apr, d.min + d.extra);
		const tr = document.createElement('tr');
		tr.innerHTML = `<td data-label="Name">${d.name}</td><td data-label="Balance">${fmt(d.balance)}</td><td data-label="APR" class="mini">${Number(d.apr || 0).toFixed(2)}%</td><td data-label="Min">${fmt(d.min || 0)}</td><td data-label="Extra">${fmt(d.extra || 0)}</td><td data-label="Months" class="right">${months === Infinity ? '–' : months}</td><td data-label="" class="right"><button class="btn ghost" data-id="${d.id}" data-action="edit">Edit</button> <button class="btn ghost" data-id="${d.id}" data-action="delete">Delete</button></td>`;
		body.appendChild(tr);
	});

	body.querySelectorAll('button').forEach(btn => {
		if (btn.dataset.action === 'delete') {
			btn.onclick = () => {
				state.debts = state.debts.filter(i => i.id !== btn.dataset.id);
				// saveLocal();
				resetDebtForm();
				viewDebt();
			};
		} else if (btn.dataset.action === 'edit') {
			btn.onclick = () => {
				const item = state.debts.find(d => d.id === btn.dataset.id);
				if (item) {
					$('#dbName').value = item.name;
					$('#dbBal').value = item.balance;
					$('#dbApr').value = item.apr || '';
					$('#dbMin').value = item.min || '';
					$('#dbExtra').value = item.extra || '';
					$('#addDebt').style.display = 'none';
					$('#updateDebt').style.display = 'inline-flex';
					$('#cancelDebtEdit').style.display = 'inline-flex';
					editingId = item.id;
				}
			};
		}
	});
	$('#dbExtraTotal').textContent = fmt(state.debts.reduce((t, d) => t + (d.extra || 0), 0));
}
export function viewGoals() {
	var left = $('#left');
	left.classList.remove('locked');
	left.querySelectorAll('.feature-lock-overlay').forEach(o => o.remove());
	left.innerHTML =
		`<h2>Savings Goals</h2>
		<div class="row" style="margin-bottom:10px">
			<div><label>Name</label><input id="gName" placeholder="e.g., Emergency Fund"/></div>
			<div><label>Target</label><input id="gTarget" type="number" min="0" step="0.01" placeholder="e.g., 5000"/></div>
			<div><label>Current Saved</label><input id="gCurrent" type="number" min="0" step="0.01" placeholder="e.g., 1200"/></div>
		</div>
		<div class="row" style="margin-bottom:10px">
			<div><label>Monthly Contribution</label><input id="gMonthly" type="number" min="0" step="0.01" placeholder="e.g., 200"/></div>
			<div><label>Notes</label><input id="gNotes" placeholder="optional"/></div>
			<div><label>&nbsp;</label>
				<button class="btn primary" id="addGoal">Add Goal</button>
				<button class="btn success" id="updateGoal" style="display:none">Update Goal</button>
				<button class="btn ghost" id="cancelGoalEdit" style="display:none">Cancel</button>
			</div>
		</div>
		<div class="hr"></div>
		<table>
			<thead><tr><th>Name</th><th>Target</th><th>Current</th><th>Monthly</th><th class="right">ETA (months)</th><th></th></tr></thead>
			<tbody id="gTbody"></tbody>
		</table>`;

	let editingId = null;

	function resetGoalForm() {
		$('#gName').value = '';
		$('#gTarget').value = '';
		$('#gCurrent').value = '';
		$('#gMonthly').value = '';
		$('#gNotes').value = '';
		$('#addGoal').style.display = 'inline-flex';
		$('#updateGoal').style.display = 'none';
		$('#cancelGoalEdit').style.display = 'none';
		editingId = null;
		$('#gName').focus();
	}

	$('#addGoal').onclick = () => {
		const name = ($('#gName').value || '').trim() || 'New Goal';
		const targetRaw = parseFloat($('#gTarget').value);
		const currentRaw = parseFloat($('#gCurrent').value);
		const monthlyRaw = parseFloat($('#gMonthly').value);
		const notes = ($('#gNotes').value || '').trim();
		const target = isNaN(targetRaw) ? 0 : targetRaw;
		const current = isNaN(currentRaw) ? 0 : currentRaw;
		const monthly = isNaN(monthlyRaw) ? 0 : monthlyRaw;
		state.goals.push({ id: uuid(), name, target, current, monthly, notes });
		// saveLocal();
		resetGoalForm();
		viewGoals();
	};

	$('#updateGoal').onclick = () => {
		const nameRaw = $('#gName').value;
		const targetRaw = parseFloat($('#gTarget').value);
		const currentRaw = parseFloat($('#gCurrent').value);
		const monthlyRaw = parseFloat($('#gMonthly').value);
		const notes = ($('#gNotes').value || '').trim();
		const name = (nameRaw || '').trim() || 'New Goal';
		const target = isNaN(targetRaw) ? 0 : targetRaw;
		const current = isNaN(currentRaw) ? 0 : currentRaw;
		const monthly = isNaN(monthlyRaw) ? 0 : monthlyRaw;
		const item = state.goals.find(g => g.id === editingId);
		if (item) {
			item.name = name;
			item.target = target;
			item.current = current;
			item.monthly = monthly;
			item.notes = notes;
			// saveLocal();
			resetGoalForm();
			viewGoals();
		}
	};

	$('#cancelGoalEdit').onclick = resetGoalForm;

	const body = $('#gTbody'); body.innerHTML = '';
	state.goals.forEach(g => {
		const remaining = Math.max(0, (g.target || 0) - (g.current || 0));
		const eta = (g.monthly || 0) > 0 ? Math.ceil(remaining / (g.monthly || 1)) : '–';
		const tr = document.createElement('tr');
		tr.innerHTML = `<td data-label="Name">${g.name}${g.notes ? `<div class='mini'>${g.notes}</div>` : ''}<div class="progress" style="margin-top:8px"><div class="bar" style="width:${Math.min(100, (g.current || 0) / (g.target || 1) * 100)}%"></div></div></td><td data-label="Target">${fmt(g.target || 0)}</td><td data-label="Current">${fmt(g.current || 0)}</td><td data-label="Monthly">${fmt(g.monthly || 0)}</td><td data-label="ETA" class="right">${eta}</td><td data-label="" class="right"><button class="btn ghost" data-id="${g.id}" data-action="edit">Edit</button> <button class="btn ghost" data-id="${g.id}" data-action="delete">Delete</button></td>`;
		body.appendChild(tr);
	});

	body.querySelectorAll('button').forEach(btn => {
		if (btn.dataset.action === 'delete') {
			btn.onclick = () => {
				state.goals = state.goals.filter(i => i.id !== btn.dataset.id);
				// saveLocal();
				resetGoalForm();
				viewGoals();
			};
		} else if (btn.dataset.action === 'edit') {
			btn.onclick = () => {
				const item = state.goals.find(g => g.id === btn.dataset.id);
				if (item) {
					$('#gName').value = item.name;
					$('#gTarget').value = item.target || '';
					$('#gCurrent').value = item.current || '';
					$('#gMonthly').value = item.monthly || '';
					$('#gNotes').value = item.notes || '';
					$('#addGoal').style.display = 'none';
					$('#updateGoal').style.display = 'inline-flex';
					$('#cancelGoalEdit').style.display = 'inline-flex';
					editingId = item.id;
				}
			};
		}
	});
}
export function viewReport() {
	var left = $('#left');
	left.classList.remove('locked');
	left.querySelectorAll('.feature-lock-overlay').forEach(o => o.remove());
	const monthlyIncome = state.income.reduce((t, i) => t + (parseFloat(i.amount) || 0), 0);
	const monthlyBills = state.bills.reduce((t, b) => t + (parseFloat(b.amount) || 0), 0);
	const monthlyVar = state.expenses.reduce((t, x) => t + (parseFloat(x.amount) || 0), 0);
	const monthlyDebt = state.debts.reduce((t, d) => t + (parseFloat(d.min) || 0) + (parseFloat(d.extra) || 0), 0);
	const totalOut = monthlyBills + monthlyVar;
	const net = monthlyIncome - totalOut;
	const bucketUsed = { essentials: 0, security: 0, lifestyle: 0, future: 0, giving: 0 };
	state.bills.forEach(b => bucketUsed[b.bucket] += (parseFloat(b.amount) || 0));
	state.expenses.forEach(x => bucketUsed[x.bucket] += (parseFloat(x.amount) || 0));
	const bucketTargets = { essentials: monthlyIncome * (state.allocations.essentials / 100), security: monthlyIncome * (state.allocations.security / 100), lifestyle: monthlyIncome * (state.allocations.lifestyle / 100), future: monthlyIncome * (state.allocations.future / 100), giving: monthlyIncome * (state.allocations.giving / 100) };

	left.innerHTML =
		`<h2>Monthly Report</h2>
		<div class="row">
			<div class="pill">Income: <strong>${fmt(monthlyIncome)}</strong></div>
			<div class="pill">Bills: <strong>${fmt(monthlyBills)}</strong></div>
			<div class="pill">Variable: <strong>${fmt(monthlyVar)}</strong></div>
			<div class="pill">Net: <strong>${fmt(net)}</strong></div>
		</div>
		<div class="hr"></div>
		<table>
			<thead><tr><th>Bucket</th><th class="right">Target</th><th class="right">Used</th><th class="right">Remaining</th></tr></thead>
			<tbody id="bucketRows"></tbody>
		</table>`;

	const body = $('#bucketRows'); body.innerHTML = '';
	Object.keys(bucketUsed).forEach(key => {
		const target = bucketTargets[key];
		const used = bucketUsed[key];
		const rem = target - used;
		const pct = target > 0 ? Math.min(100, (used / target) * 100) : (used > 0 ? 100 : 0);
		const tr = document.createElement('tr');
		tr.innerHTML = `<td data-label="Bucket">${key.charAt(0).toUpperCase() + key.slice(1)}</td><td data-label="Target" class="right">${fmt(target)}</td><td data-label="Used" class="right">${fmt(used)}</td><td data-label="Remaining" class="right" style="color:${rem < 0 ? '#ff8170' : '#9EE493'}">${fmt(rem)}</td>`;
		body.appendChild(tr);
		const trBar = document.createElement('tr');
		trBar.innerHTML = `<td colspan="4"><div class="progress ${used > target ? 'over' : ''}"><div class="bar" style="width:${pct}%;"></div></div></td>`;
		body.appendChild(trBar);
	});
}
export function viewBackup() {
	var left = $('#left');
	left.classList.remove('locked');
	left.querySelectorAll('.feature-lock-overlay').forEach(o => o.remove());
	left.innerHTML =
		`<h2>Backup / Import</h2>
		<div class="row">
			<button class="btn" id="exportJson">Export JSON</button>
			<button class="btn" id="exportPbs">Download .pbs</button>
			<input type="file" id="importFile" accept=".json,.pbs,application/json" style="display:none" />
			<button class="btn" id="importFileBtn">Import from File (.json/.pbs)</button>
			<button class="btn danger" id="clearAll" title="Master Reset: Remove all saved PBS data on this device">Master Reset (Clear All Data)</button>
		</div>
		<div class="mini" style="margin-top:6px;color:#ffb3a7">Warning: Master Reset erases all PBS data stored in this browser for this device.</div>
		<div class="hr"></div>
		<label class="mini">Paste JSON</label>
		<textarea id="jsonArea" rows="12" placeholder="JSON will appear here on export, or paste JSON here to import..."></textarea>
		<div class="row" style="margin-top:8px">
			<button class="btn" id="importJson">Import from Text</button>
		</div>`;

	$('#exportJson').onclick = () => { $('#jsonArea').value = JSON.stringify(state, null, 2); };
	$('#exportPbs').onclick = () => {
		try {
			const data = JSON.stringify(state);
			const blob = new Blob([data], { type: 'application/json' });
			const a = document.createElement('a');
			const title = (state.title || 'PBS').replace(/[^a-z0-9\-_]+/gi, '_');
			const stamp = new Date().toISOString().slice(0, 10);
			a.href = URL.createObjectURL(blob);
			a.download = `${title}_${stamp}.pbs`;
			document.body.appendChild(a); a.click(); a.remove();
		} catch (e) { alert('Export failed'); }
	};
	$('#importJson').onclick = () => {
		try {
			const data = JSON.parse($('#jsonArea').value);
			Object.assign(state, data);
			// saveLocal();
			// route();
			// renderLegendAndChart();
			alert('Imported ✓');
		} catch (e) { alert('Invalid JSON'); }
	};
	$('#clearAll').onclick = () => {
		if (confirm('Erase all saved data?')) {
			// localStorage.removeItem(LS_KEY);
			// (LEGACY_KEYS || []).forEach(k => localStorage.removeItem(k));
			location.reload();
		}
	};
	$('#importFileBtn').onclick = () => $('#importFile').click();
	$('#importFile').addEventListener('change', (e) => {
		const file = (e.target && e.target.files && e.target.files[0]) || null; if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const data = JSON.parse(reader.result);
				Object.assign(state, data);
				// saveLocal();
				// route();
				// renderLegendAndChart();
				alert('Imported ✓ from file');
			} catch (err) { alert('Invalid file'); }
		};
		reader.readAsText(file);
	});
}
