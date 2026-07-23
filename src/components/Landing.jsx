/**
 * @file Landing.jsx
 * @description 首頁英雄區塊（01 / Signal）。採編輯式極簡排版：
 *   mono 眉標（職稱）＋ 大字名字標題 ＋ 一句定位陳述，
 *   底部為 mono 的捲動提示與座標資訊。
 */
import React from "react";

/** Landing — 首頁英雄區塊，不接受任何 props。 */
function Landing() {
	return (
		<section className="hero container section" id="index">
			<div className="section-head">
				<span className="section-head__index">(01)</span>
				<span className="section-head__label">Signal</span>
				<span className="section-head__meta">Portfolio — 2024 / 25</span>
			</div>

			<div className="hero__body">
				<p className="hero__eyebrow">Front End Developer — Graphic Designer</p>
				<h1 className="hero__title">Shane Lin</h1>
				<p className="hero__statement">
					I shape product thinking, visual direction and front-end execution into
					working systems — <span className="accent">from first idea to working form.</span>
				</p>
			</div>

			<div className="hero__foot">
				<span className="scroll-cue">Scroll to explore</span>
				<span>台北 · Taipei</span>
			</div>
		</section>
	);
}

export default Landing;
