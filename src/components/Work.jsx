/**
 * @file Work.jsx
 * @description 作品展示區塊（02 / Selected Work）。以編號索引列呈現每件作品：
 *   序號 ＋ 標題／類型 ＋ 客戶年份，滑鼠懸停時展開首圖預覽並點擊進入詳情頁。
 *
 *   捲動行為：進入 #work 時區塊會被「釘住」（sticky pin），隨著向下捲動依序
 *   展開 4 項作品；全部展開後才解除釘住、繼續捲動進入 #practice。
 */
import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { PRODUCT_DATA } from "../../constants";

/**
 * Work — 作品索引區塊
 *
 * @param {React.RefObject} workRef - 父層傳入的 ref，供捲動偵測定位
 */
function Work({ workRef }) {
	const total = PRODUCT_DATA.length;
	// 目前展開中的作品索引（0 ~ total-1），一次只展開一項
	const [active, setActive] = useState(0);
	// 內層可位移的軌道（section.work-inner），用來把展開項移到視窗中央
	const innerRef = useRef(null);

	useEffect(() => {
		// workRef 綁在最外層 .work-scroll 高容器上，用它計算捲動進度
		const wrap = workRef?.current;
		if (!wrap) return;

		// 尊重使用者的「減少動態效果」偏好：不釘住展開，交由 CSS 靜態呈現
		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;
		if (reduceMotion) return;

		// 每一項「展開後」所佔的捲動距離門檻（累加）。
		// thresholds[i] = 前面各項展開高度的總和 → 切到第 i 項需捲動的距離。
		let thresholds = [0];
		// 各項展開後的高度（供置中計算使用）
		let expanded = [];
		// 收合列基準高、以及第一列在軌道內的起始 Y（含上方 section-head）
		let base = 0;
		let top0 = 0;

		// 量測各項展開高度，並據此設定釘住容器的總捲動高度。
		// 每向下切到下一項，所需距離就等於上一項作品展開後的高度。
		const measure = () => {
			const rows = wrap.querySelectorAll(".project");
			if (!rows.length) return;
			// 收合列高（基準）：取最矮的一列即為未展開狀態的高度
			base = Math.min(...[...rows].map((r) => r.offsetHeight));
			// 第一列頂端在軌道內的位置（含其上方的 section-head 區塊）
			top0 = rows[0].offsetTop;
			// 各項展開高度 = 收合基準 + 該項圖片高度（含上方間距）
			expanded = [...rows].map((r) => {
				const img = r.querySelector(".project__media img");
				const media = img ? img.offsetHeight + 24 : 0; // 24 = 圖片上方 margin
				return base + media;
			});
			// 累加成門檻
			thresholds = [0];
			for (let i = 1; i < rows.length; i++) {
				thresholds[i] = thresholds[i - 1] + expanded[i - 1];
			}
			// 容器總高 = 一個視窗 + 所有項目展開高度總和（最後一項也留滿一段距離）
			const totalDist = thresholds[rows.length - 1] + expanded[rows.length - 1];
			wrap.style.height = `${window.innerHeight + totalDist}px`;
		};

		let raf = 0;
		const update = () => {
			raf = 0;
			const vh = window.innerHeight;
			// 釘住區間內可捲動的總距離（= 容器高 - 一個視窗高）
			const scrollable = wrap.offsetHeight - vh;
			// 已捲過容器頂端的距離
			const scrolled = Math.min(
				Math.max(-wrap.getBoundingClientRect().top, 0),
				Math.max(scrollable, 0)
			);
			// 整體捲動進度（0~1），驅動左側垂直進度條的填充量
			const progress = scrollable > 0 ? scrolled / scrollable : 0;
			wrap.style.setProperty("--work-progress", progress.toFixed(4));
			// 依累加門檻決定展開到第幾項
			let index = 0;
			for (let i = 0; i < total; i++) {
				if (scrolled >= thresholds[i]) index = i;
			}
			setActive(index);

			// 將展開項置中於視窗：位移軌道，使該項展開卡片的中線對齊視窗中線。
			// 該列頂端 = top0 + index * base（前面各列皆為收合基準高，與哪一項展開無關），
			// 因此不受 React 尚未重繪的影響，每一項展開時都精準落在裝置正中央。
			const inner = innerRef.current;
			if (inner && expanded.length) {
				const rowTop = top0 + index * base;
				const cardH = expanded[index] || base;
				const shift = vh / 2 - rowTop - cardH / 2;
				inner.style.transform = `translateY(${shift}px)`;
			}
		};

		const onScroll = () => {
			if (raf) return;
			raf = requestAnimationFrame(update);
		};

		// 圖片載入後尺寸才確定，需重新量測
		const imgs = wrap.querySelectorAll(".project__media img");
		const onImgLoad = () => {
			measure();
			update();
		};
		imgs.forEach((img) => {
			if (!img.complete) img.addEventListener("load", onImgLoad);
		});

		const onResize = () => {
			measure();
			update();
		};

		measure();
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
			imgs.forEach((img) => img.removeEventListener("load", onImgLoad));
			if (raf) cancelAnimationFrame(raf);
		};
	}, [total]);

	return (
		<div
			className="work-scroll"
			id="work"
			ref={workRef}
			style={{ "--work-steps": total }}
		>
			<div className="work-sticky">
				{/* 左側垂直進度條：對齊 project-index 左緣，隨捲動填充 */}
				<div className="work-progress-rail" aria-hidden="true">
					<div className="work-progress">
						<div className="work-progress__fill" />
					</div>
				</div>

				<section className="container section work-inner" ref={innerRef}>
					<div className="section-head">
						<span className="section-head__index">(02)</span>
						<span className="section-head__label">Selected Work</span>
						<span className="section-head__meta">
							{String(total).padStart(2, "0")} Projects
						</span>
					</div>

					<ul className="project-index">
						{PRODUCT_DATA.map((product, i) => (
							<li
								className={`project${i === active ? " is-open" : ""}`}
								key={product.key}
							>
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
			</div>
		</div>
	);
}

export default Work;
