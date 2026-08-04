/**
 * @file constants/sections.js
 * @description 首頁區塊清單的單一真相來源。
 *   Nav（全螢幕選單）與 ScrollRail（右下角導航線）共用這份資料 ——
 *   分開維護的話，改了區塊 id 只更新其中一邊，另一邊會靜默失效
 *   （getElementById 找不到元素時 ?. 會直接短路，不會報錯）。
 *
 *   name 必須與各區塊 <section> 上的 id 完全一致。
 */
export const SECTIONS = [
	{ num: "01", name: "index", label: "Index", meta: "Introduction" },
	{ num: "02", name: "work", label: "Work", meta: "Selected projects" },
	{ num: "03", name: "practice", label: "Practice", meta: "Capabilities" },
	{ num: "04", name: "about", label: "About", meta: "Profile" },
	{ num: "05", name: "contact", label: "Contact", meta: "Get in touch" },
];
