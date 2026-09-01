/**
 * @file Skill.jsx
 * @description 專業能力區塊（03 / Practice）。以一句方法論陳述帶出，
 *   下方為可拖曳的 3D 文字圓柱，循環展示各項設計與開發能力。
 *
 *   圓柱（PracticeCylinder）以 lazy 載入，把 three.js 拆出主包 ——
 *   捲到此區塊前不會下載。
 */
import { lazy, Suspense } from "react";

const PracticeCylinder = lazy(() => import("./PracticeCylinder"));

/** 能力項目 — 於 3D 圓柱上循環展示。 */
const DISCIPLINES = [
	"User Interface Design",
	"Graphic Design",
	"Logo & Brand",
	"Front-End Development",
	"Digital Illustration",
];

/** Skill — Practice 區塊，不接受任何 props。 */
function Skill() {
	return (
		<section className="container section" id="practice">
			<div className="section-head">
				<span className="section-head__index">(03)</span>
				<h2 className="section-head__label">Practice</h2>
				<span className="section-head__meta">Capabilities</span>
			</div>

			<p className="practice__lead">
				One continuous line — product logic, visual direction and technical
				execution held together as a single, maintainable system.
			</p>

			{/* fallback 為 null：.practice-3d 有固定高度撐著，載入期間不會有版面跳動 */}
			<Suspense fallback={null}>
				<PracticeCylinder items={DISCIPLINES} />
			</Suspense>
		</section>
	);
}

export default Skill;
