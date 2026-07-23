/**
 * @file About.jsx
 * @description 關於區塊（04 / About）。左欄為 mono 的索引資訊，
 *   右欄為編輯式的自述段落，延續「從想法到成形」的一貫調性。
 */
import React from "react";

/** About — 關於區塊，不接受任何 props。 */
function About() {
	return (
		<section className="container section" id="about">
			<div className="section-head">
				<span className="section-head__index">(04)</span>
				<span className="section-head__label">About</span>
				<span className="section-head__meta">Profile</span>
			</div>

			<div className="about__grid">
				<div className="about__aside">
					ROLE — Front End Developer
					<br />
					FOCUS — Graphic Design
					<br />
					BASE — Taipei, Taiwan
					<br />
					STATUS — Open to work
				</div>
				<div className="about__body">
					<p>
						I&apos;m Shane — a designer-developer working across visual identity and
						the interfaces they live in. I care about keeping one continuous line
						between how something looks and how it actually runs.
					</p>
					<p>
						From logos and brand systems to responsive front-ends, my aim is the
						same: <span className="accent">restraint, rhythm, and work that holds up</span> —
						shaped from the first idea through to a working form.
					</p>
				</div>
			</div>
		</section>
	);
}

export default About;
