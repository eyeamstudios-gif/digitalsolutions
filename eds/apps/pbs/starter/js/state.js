// State management for PBS Starter
export const state = {
  title: "Untitled",
  allocations: { essentials: 55, security: 20, lifestyle: 15, future: 5, giving: 5 },
  bucketLabels: {
    essentials: "Essentials (Housing, Utilities, Food, Transport)",
    security: "Financial Security (Debt, Emergency, Retirement)",
    lifestyle: "Lifestyle & Growth (Health, Learning, Hobbies)",
    future: "Freedom / Future Fund (Investments, Big Goals)",
    giving: "Community / Giving (Donations, Tithes)"
  },
  income: [],
  bills: [],
  expenses: [],
  debts: [],
  goals: [],
  debtStrategy: "snowball",
  plan: "growth",
  includeDebtInSecurity: false
};

export function initState() {
  // Load state from localStorage if available
  try {
    const raw = localStorage.getItem("EAS_PBS_COMPREHENSIVE_v2");
    if (raw) {
      const s = JSON.parse(raw);
      Object.assign(state, { ...state, ...s });
    }
  } catch (e) {
    console.warn("State load failed", e);
  }
  // Ensure arrays/objects are valid
  ["income", "bills", "expenses", "debts", "goals"].forEach(k => {
    if (!Array.isArray(state[k])) state[k] = [];
  });
  if (!state.allocations || typeof state.allocations !== "object") state.allocations = { essentials: 55, security: 20, lifestyle: 15, future: 5, giving: 5 };
  if (!state.bucketLabels || typeof state.bucketLabels !== "object") state.bucketLabels = {
    essentials: "Essentials (Housing, Utilities, Food, Transport)",
    security: "Financial Security (Debt, Emergency, Retirement)",
    lifestyle: "Lifestyle & Growth (Health, Learning, Hobbies)",
    future: "Freedom / Future Fund (Investments, Big Goals)",
    giving: "Community / Giving (Donations, Tithes)"
  };
  if (typeof state.debtStrategy !== "string") state.debtStrategy = "snowball";
  if (typeof state.plan !== "string") state.plan = "growth";
  if (typeof state.includeDebtInSecurity !== "boolean") state.includeDebtInSecurity = false;
}
