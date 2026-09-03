/**
 * @file constants/sections.js
 * @description 首頁區塊清單的單一真相來源。
 *   Nav（全螢幕選單）與 ScrollRail（右下角導航線）共用這份資料 ——
 *   分開維護的話，改了區塊 id 只更新其中一邊，另一邊會靜默失效
 *   （getElementById 找不到元素時 ?. 會直接短路，不會報錯）。
 *
 *   name 必須與各區塊 <section> 上的 id 完全一致。
 *   zh 是選單裡跟在英文標題後的中文對照（桌機 hover 時浮現，手機常駐）。
 */
export const SECTIONS = [
	{ num: "01", name: "index", label: "Index", zh: "首頁", meta: "Introduction" },
	{ num: "02", name: "work", label: "Work", zh: "作品", meta: "Selected projects" },
	{ num: "03", name: "practice", label: "Practice", zh: "專長", meta: "Capabilities" },
	{ num: "04", name: "about", label: "About", zh: "關於", meta: "Profile" },
	{ num: "05", name: "contact", label: "Contact", zh: "聯絡", meta: "Get in touch" },
];
