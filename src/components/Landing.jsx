/**
 * @file Landing.jsx
 * @description 首頁英雄區塊（01 / Signal）。採編輯式極簡排版：
 *   mono 眉標（職稱）＋ 大字名字標題 ＋ 一句定位陳述，
 *   底部為 mono 的捲動提示與座標資訊。
 */
import { useEffect, useRef, useState } from "react";

/**
 * 輪播的定位陳述。每句同時備中英兩版，各自拆成數段，
 * accent: true 的段落會套用強調色。
 *
 * zh 是主述句，靜態呈現；en 逐字打出、字級較小，作為底下的一層節奏。
 * 兩者在同一個 type.i 下切換 —— 換句的時機落在英文已刪空的空拍上，
 * 中文接著換，不會出現中英不同句的畫面。
 *
 * ⚠ 文案請自行改寫。長度盡量維持相近：行數若跳動，整個 hero 會上下抖，
 * 靠 min-height 只能吸收到一定程度（中文抓 2 行、英文抓 3 行）。
 */
const STATEMENTS = [
	{
		zh: [
			{ text: "從產品思維到視覺方向與前端實作，" },
			{ text: "收斂成一套跑得動、也養得起的系統。", accent: true },
		],
		en: [
			{
				text: "I shape product thinking, visual direction and front-end execution into working systems — ",
			},
			{ text: "from first idea to working form.", accent: true },
		],
	},
	{
		zh: [
			{ text: "我設計品牌系統，" },
			{ text: "也親手將它們落地實作為使用者介面。", accent: true },
		],
		en: [
			{
				text: "I design brand systems and build the interfaces they live in — ",
			},
			{ text: "one continuous line, end to end.", accent: true },
		],
	},
	{
		zh: [
			{ text: "比起設計稿上的美觀，" },
			{ text: "我更在意實際上線後的穩定度與耐用度。", accent: true },
		],
		en: [
			{
				text: "I care less about how something looks in a mockup — ",
			},
			{ text: "and more about how it holds up in production.", accent: true },
		],
	},
];

const TYPE_MS = 26; // 每個字元的間隔
const DELETE_MS = 12; // 刪除比輸入快，回頭的過程不該讓人等
const HOLD_MS = 2800; // 打完後的停留，要夠讀完一句
const CLEAR_MS = 480; // 清空到下一句開始之間的空拍

/** 各句英文的總字元數，供打字進度計數 */
const LENGTHS = STATEMENTS.map((stmt) =>
	stmt.en.reduce((sum, s) => sum + s.text.length, 0)
);

/**
 * 把分段陣列輸出成帶強調色的 span。中英兩版共用同一套渲染。
 *
 * @param {{text: string, accent?: boolean}[]} segments
 */
function renderSegments(segments) {
	return segments.map((s, i) =>
		s.accent ? (
			<span className="accent" key={i}>
				{s.text}
			</span>
		) : (
			<span key={i}>{s.text}</span>
		)
	);
}

/**
 * 依已顯示的字元數，把整句裁切成部分顯示的分段。
 * 逐段扣除額度，讓截斷點能正確落在任何一段之中。
 *
 * @param {{text: string, accent?: boolean}[]} segments
 * @param {number} shown - 已顯示的字元總數
 */
function sliceSegments(segments, shown) {
	let left = shown;
	return segments.map((s) => {
		const take = Math.max(0, Math.min(s.text.length, left));
		left -= take;
		return { ...s, text: s.text.slice(0, take) };
	});
}

/** Landing — 首頁英雄區塊，不接受任何 props。 */
function Landing() {
	// hero__title 的游標互動：橘色光斑在文字筆畫內跟隨游標流動
	const titleRef = useRef(null);

	const reduceMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)"
	).matches;

	// 打字機狀態：i = 第幾句、shown = 已顯示字元數、phase = 輸入中／刪除中。
	// 三個值合成一個物件，讓每次推進只觸發一次 re-render。
	// 「減少動態效果」時直接停在第一句的完整狀態，不進迴圈。
	const [type, setType] = useState(() =>
		reduceMotion
			? { i: 0, shown: LENGTHS[0], phase: "hold" }
			: { i: 0, shown: 0, phase: "typing" }
	);

	// 捲離首屏就暫停 —— 否則使用者在頁尾閱讀時，這裡仍以每 26ms 一次的
	// 頻率持續 setState。與 PracticeCylinder 停掉 frameloop 是同一個考量。
	const statementRef = useRef(null);
	const [inView, setInView] = useState(true);

	useEffect(() => {
		const el = statementRef.current;
		if (!el) return;
		const io = new IntersectionObserver(([entry]) =>
			setInView(entry.isIntersecting)
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	// 自我排程的打字迴圈：每次 state 變動就依當前階段排下一次推進。
	// 用遞迴的 setTimeout 而非 setInterval —— 各階段的間隔不同，
	// 而且 cleanup 能保證同時只有一個計時器在跑。
	useEffect(() => {
		if (reduceMotion || !inView) return;

		const total = LENGTHS[type.i];
		let delay;
		let next;

		if (type.phase === "typing") {
			if (type.shown < total) {
				delay = TYPE_MS;
				next = { ...type, shown: type.shown + 1 };
			} else {
				delay = HOLD_MS;
				next = { ...type, phase: "deleting" };
			}
		} else {
			if (type.shown > 0) {
				delay = DELETE_MS;
				next = { ...type, shown: type.shown - 1 };
			} else {
				delay = CLEAR_MS;
				next = {
					i: (type.i + 1) % STATEMENTS.length,
					shown: 0,
					phase: "typing",
				};
			}
		}

		const timer = setTimeout(() => setType(next), delay);
		return () => clearTimeout(timer);
	}, [type, reduceMotion, inView]);

	useEffect(() => {
		const el = titleRef.current;
		if (!el) return;

		// 光斑目標座標（游標相對標題）與緩動後的實際座標
		let targetX = -300;
		let targetY = -300;
		let curX = -300;
		let curY = -300;
		let inside = false;
		let raf = 0;

		const BASE = 160; // 色塊靜止時的邊長
		const tick = () => {
			// 以 lerp 緩動趨近游標，做出延遲「拖曳」感（係數越小拖得越久）
			const dx = targetX - curX;
			const dy = targetY - curY;
			curX += dx * 0.12;
			curY += dy * 0.12;
			el.style.setProperty("--mx", `${curX}px`);
			el.style.setProperty("--my", `${curY}px`);

			// 依「與游標的距離」（等同移動速度）沿方向拉伸色塊，停下即縮回方形
			const bw = BASE + Math.min(Math.abs(dx) * 1.1, 240);
			const bh = BASE + Math.min(Math.abs(dy) * 1.1, 240);
			el.style.setProperty("--bw", `${bw}px`);
			el.style.setProperty("--bh", `${bh}px`);

			// 離開且已幾乎停穩就停止迴圈，避免持續空轉
			if (!inside && Math.hypot(dx, dy) < 0.5) {
				raf = 0;
				return;
			}
			raf = requestAnimationFrame(tick);
		};
		const startLoop = () => {
			if (!raf) raf = requestAnimationFrame(tick);
		};

		const onMove = (e) => {
			const rect = el.getBoundingClientRect();
			targetX = e.clientX - rect.left;
			targetY = e.clientY - rect.top;
			startLoop();
		};
		const onEnter = () => {
			inside = true;
			el.style.setProperty("--spot", "1"); // 淡入橘色光斑
			startLoop();
		};
		const onLeave = () => {
			inside = false;
			el.style.setProperty("--spot", "0"); // 淡出
		};

		el.addEventListener("mousemove", onMove);
		el.addEventListener("mouseenter", onEnter);
		el.addEventListener("mouseleave", onLeave);

		return () => {
			el.removeEventListener("mousemove", onMove);
			el.removeEventListener("mouseenter", onEnter);
			el.removeEventListener("mouseleave", onLeave);
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);

	return (
		<section className="hero container section" id="index">
			<div className="section-head">
				<span className="section-head__index">(01)</span>
				<h2 className="section-head__label">Signal</h2>
				<span className="section-head__meta">Portfolio — 2024 / 25</span>
			</div>

			<div className="hero__body">
				<p className="hero__eyebrow">Front End Developer — Graphic Designer</p>
				<h1 className="hero__title" ref={titleRef}>Shane Lin</h1>
				{/* 主述句：中文靜態呈現，英文在下方逐字打出 */}
				<p className="hero__statement-zh">
					{renderSegments(STATEMENTS[type.i].zh)}
				</p>

				{/* 動畫中的文字對螢幕閱讀器只是一串不斷變動的殘句，
				    所以整段標為 aria-hidden，另備一份完整的靜態文字在下方。 */}
				<p className="hero__statement" ref={statementRef} aria-hidden="true">
					{renderSegments(sliceSegments(STATEMENTS[type.i].en, type.shown))}
					<span className="type-caret" />
				</p>

				{/* 給輔助技術讀的完整英文版本（中文已在上方的 DOM 中） */}
				<p className="sr-only">
					{STATEMENTS.map((stmt) =>
						stmt.en.map((s) => s.text).join("")
					).join(" ")}
				</p>
			</div>

			<div className="hero__foot">
				<span className="scroll-cue">Scroll to explore</span>
				<span>新北 · New Taipei</span>
			</div>
		</section>
	);
}

export default Landing;
