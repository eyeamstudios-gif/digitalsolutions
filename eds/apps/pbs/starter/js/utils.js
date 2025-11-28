// Shared utility functions for PBS Starter
export const $ = sel => document.querySelector(sel);
export const fmt = n => (isNaN(Number(n)) ? 0 : Number(n)).toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
export const uuid = () => Math.random().toString(36).slice(2, 9);
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
