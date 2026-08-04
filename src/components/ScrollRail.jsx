/**
 * @file ScrollRail.jsx
 * @description 右下角的捲動導航線。一條細垂直線顯示全頁進度，
 *   下方以 mono 數字標示當前所在區塊（01～05）；捲到頁面最底時
 *   切換成「Back to top」，點擊回到頂部。
 *
 *   固定在視窗右下，跨所有頁面存在。作品詳情頁與相簿頁沒有這些區塊，
 *   此時數字層自動隱藏，只保留觸底後的回頂按鈕。
 */
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { SECTIONS } from "../../constants/sections";

/** 判定「已到底部」的容差（px）。留一點餘裕，避免瀏覽器捲動上限的零頭誤差 */
const BOTTOM_SLACK = 120;

/**
 * ScrollRail — 捲動位置指示器，不接受任何 props。
 *
 * 區塊偵測不用 offsetTop 比大小，改用 IntersectionObserver 搭配
 * 一條「偵測線」：rootMargin 的上下值相加為 -100%，會把觀察區域壓成
 * 視窗 45% 高度處的一條零高度水平線。哪個區塊跨過這條線，哪個就是當前區塊。
 *
 * 這個做法比手算 offsetTop 穩：Work 區塊是被 sticky 釘住的高容器，
 * 高度由 JS 動態設定，用座標比大小很容易在展開過程中判斷錯誤。
 */
function ScrollRail() {
	const location = useLocation();
	const [active, setActive] = useState(null); // 當前區塊的 name
	const [atBottom, setAtBottom] = useState(false);
	const railRef = useRef(null);

	// 區塊偵測。路由切換後 DOM 換了一批，必須重新掛載觀察器。
	useEffect(() => {
		const targets = SECTIONS.map((s) => document.getElementById(s.name)).filter(
			Boolean
		);
		// 非首頁沒有這些區塊，直接清空指示
		if (!targets.length) {
			setActive(null);
			return;
		}

		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) setActive(entry.target.id);
				}
			},
			// -45% / -55% 相加為 -100%：觀察區域被壓成 45% 高度處的一條線
			{ rootMargin: "-45% 0px -55% 0px" }
		);
		targets.forEach((el) => io.observe(el));
		return () => io.disconnect();
		// lazy 區塊要等掛載完才找得到，延一拍由 pathname 觸發已足夠；
		// 若之後仍偶發抓不到，可改用 MutationObserver 監看。
	}, [location.pathname]);

	// 全頁進度與觸底偵測
	useEffect(() => {
		let raf = 0;

		const update = () => {
			raf = 0;
			const doc = document.documentElement;
			const scrollable = doc.scrollHeight - window.innerHeight;
			const progress = scrollable > 0 ? window.scrollY / scrollable : 0;

			// 進度寫進 CSS 變數而非 state —— 每次捲動都 setState 會讓
			// 整棵樹重新 render，這裡只需要一條線改變高度。
			railRef.current?.style.setProperty(
				"--rail-progress",
				Math.min(Math.max(progress, 0), 1).toFixed(4)
			);
			setAtBottom(window.innerHeight + window.scrollY >= doc.scrollHeight - BOTTOM_SLACK);
		};

		const onScroll = () => {
			if (raf) return; // 每幀最多算一次
			raf = requestAnimationFrame(update);
		};

		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			if (raf) cancelAnimationFrame(raf);
		};
	}, [location.pathname]);

	const current = SECTIONS.find((s) => s.name === active);
	// 觸底時讓位給回頂按鈕；非首頁沒有 current 也不顯示
	const showIndex = Boolean(current) && !atBottom;

	return (
		<div className="scroll-rail" ref={railRef}>
			<div
				className={`scroll-rail__layer scroll-rail__index${showIndex ? " is-on" : ""}`}
				aria-hidden="true"
			>
				<span className="scroll-rail__line">
					<span className="scroll-rail__fill" />
				</span>
				<span className="scroll-rail__num">{current?.num ?? "—"}</span>
				<span className="scroll-rail__label">{current?.label ?? ""}</span>
			</div>

			<button
				type="button"
				className={`scroll-rail__layer scroll-rail__top${atBottom ? " is-on" : ""}`}
				onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
				// 隱藏時移出 tab 順序，避免鍵盤跳到看不見的按鈕上
				tabIndex={atBottom ? 0 : -1}
				aria-hidden={!atBottom}
			>
				<span className="scroll-rail__arrow" aria-hidden="true">
					↑
				</span>
				<span className="scroll-rail__label">Back to top</span>
			</button>
		</div>
	);
}

export default ScrollRail;
