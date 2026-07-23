/**
 * @file Work.jsx
 * @description 作品展示區塊（02 / Selected Work）。以編號索引列呈現每件作品：
 *   序號 ＋ 標題／類型 ＋ 客戶年份，滑鼠懸停時展開首圖預覽並點擊進入詳情頁。
 */
import React from "react";
import { NavLink } from "react-router-dom";
import { PRODUCT_DATA } from "../../constants";

/**
 * Work — 作品索引區塊
 *
 * @param {React.RefObject} workRef - 父層傳入的 ref，供捲動偵測定位
 */
function Work({ workRef }) {
	return (
		<section className="container section" id="work" ref={workRef}>
			<div className="section-head">
				<span className="section-head__index">(02)</span>
				<span className="section-head__label">Selected Work</span>
				<span className="section-head__meta">
					{String(PRODUCT_DATA.length).padStart(2, "0")} Projects
				</span>
			</div>

			<ul className="project-index">
				{PRODUCT_DATA.map((product, i) => (
					<li className="project" key={product.key}>
						<NavLink className="project__link" to={`/detail/${product.key}`}>
							<div className="project__head">
								<span className="project__num">
									{String(i + 1).padStart(2, "0")}
								</span>
								<div className="project__titles">
									<h3 className="project__title">{product.title}</h3>
									<span className="project__cat">{product.category}</span>
								</div>
								<span className="project__year">{product.customer}</span>
								<span className="project__view">View →</span>
							</div>
							<div className="project__media">
								<div>
									<img src={product.homeImages[0].src} alt={product.title} />
								</div>
							</div>
						</NavLink>
					</li>
				))}
			</ul>
		</section>
	);
}

export default Work;
