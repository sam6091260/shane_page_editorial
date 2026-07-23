/**
 * @file Skill.jsx
 * @description 專業能力區塊（03 / Practice）。以一句方法論陳述帶出，
 *   下方為可拖曳的水平跑馬燈，循環展示各項設計與開發能力。
 */
import React, { useEffect, useRef } from "react";

/** 能力項目 — 於跑馬燈中循環展示。 */
const DISCIPLINES = [
	"User Interface Design",
	"Graphic Design",
	"Logo & Brand",
	"Front-End Development",
	"Digital Illustration",
];

/**
 * Skill — Practice 區塊，不接受任何 props。
 * useEffect 內綁定滑鼠拖曳事件，讓跑馬燈可水平拖曳瀏覽。
 */
function Skill() {
	const scrollRef = useRef(null);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		let isDown = false;
		let startX;
		let scrollLeft;

		const handleMouseDown = (e) => {
			isDown = true;
			startX = e.pageX;
			scrollLeft = el.scrollLeft;
			el.classList.add("active");
		};
		const handleMouseMove = (e) => {
			if (!isDown) return;
			e.preventDefault();
			el.scrollLeft = scrollLeft - (e.pageX - startX);
		};
		const handleMouseUp = () => {
			isDown = false;
			el.classList.remove("active");
		};

		el.addEventListener("mousedown", handleMouseDown);
		el.addEventListener("mousemove", handleMouseMove);
		el.addEventListener("mouseup", handleMouseUp);
		el.addEventListener("mouseleave", handleMouseUp);
		return () => {
			el.removeEventListener("mousedown", handleMouseDown);
			el.removeEventListener("mousemove", handleMouseMove);
			el.removeEventListener("mouseup", handleMouseUp);
			el.removeEventListener("mouseleave", handleMouseUp);
		};
	}, []);

	return (
		<section className="container section" id="practice">
			<div className="section-head">
				<span className="section-head__index">(03)</span>
				<span className="section-head__label">Practice</span>
				<span className="section-head__meta">Capabilities</span>
			</div>

			<p className="practice__lead">
				One continuous line — product logic, visual direction and technical
				execution held together as a single, maintainable system.
			</p>

			<div className="marquee" ref={scrollRef}>
				<div className="marquee__content">
					{[...Array(3)].map((_, i) => (
						<React.Fragment key={i}>
							{DISCIPLINES.map((d, j) => (
								<span key={`${i}-${j}`}>
									{d}
									<span className="marquee__dot"> ● </span>
								</span>
							))}
						</React.Fragment>
					))}
				</div>
			</div>
		</section>
	);
}

export default Skill;
