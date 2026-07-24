/**
 * @file Landing.jsx
 * @description 首頁英雄區塊（01 / Signal）。採編輯式極簡排版：
 *   mono 眉標（職稱）＋ 大字名字標題 ＋ 一句定位陳述，
 *   底部為 mono 的捲動提示與座標資訊。
 */
import React, { useEffect, useRef } from "react";
import heroVideo from "../assets/hero_video.mp4";

/** Landing — 首頁英雄區塊，不接受任何 props。 */
function Landing() {
	// hero__title 的游標互動：橘色光斑在文字筆畫內跟隨游標流動
	const titleRef = useRef(null);

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
			{/* 背景影片（設計元素 × 建築攝影穿插）＋暗色遮罩，確保文字可讀 */}
			<video
				className="hero__video"
				autoPlay
				loop
				muted
				playsInline
				preload="metadata"
				aria-hidden="true"
				poster={`${import.meta.env.BASE_URL}hero-poster.jpg`}
			>
				{/* <source src={`${import.meta.env.BASE_URL}hero-bg.webm`} type="video/webm" /> */}
				<source src={heroVideo} type="video/mp4" />
			</video>
			<div className="hero__scrim" aria-hidden="true" />

			<div className="section-head">
				<span className="section-head__index">(01)</span>
				<span className="section-head__label">Signal</span>
				<span className="section-head__meta">Portfolio — 2024 / 25</span>
			</div>

			<div className="hero__body">
				<p className="hero__eyebrow">Front End Developer — Graphic Designer</p>
				<h1 className="hero__title" ref={titleRef}>Shane Lin</h1>
				<p className="hero__statement">
					I shape product thinking, visual direction and front-end execution into
					working systems — <span className="accent">from first idea to working form.</span>
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
