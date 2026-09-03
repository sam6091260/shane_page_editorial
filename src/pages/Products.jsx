/**
 * @file Products.jsx
 * @description 作品詳情頁。以圖片為主體：極簡的標題與後設資料在上，
 *   下方是連續的大圖序列（單張滿版、或兩張並排），點擊任一張以 Lightbox 放大。
 *   底部提供「下一件作品」導覽，讓瀏覽動線留在作品之間。
 *
 *   支援從首頁或 Gallery 進入，返回時回到來源頁。
 */
import "../styles/Detail.scss";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { PRODUCT_DATA } from "../../constants";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import usePageMeta from "../hooks/usePageMeta";

/** Lightbox 關閉時的索引值。用 -1 而非 null，才能直接以 index >= 0 判斷開闔 */
const CLOSED = -1;

/**
 * 把連續兩張 postTwo 配成一組並排，其餘各自單張滿版。
 *
 * 傳入的元素必須已帶 index（在整份圖片序列中的位置），
 * 分組後才能正確對應 Lightbox 的投影片編號。
 *
 * @param {Array<{index: number, style?: string}>} images
 * @returns {Array<{type: 'single'|'pair', images: Array}>}
 */
function groupImages(images) {
	const groups = [];
	let i = 0;
	while (i < images.length) {
		const current = images[i];
		const next = images[i + 1];
		if (current.style === "postTwo" && next?.style === "postTwo") {
			groups.push({ type: "pair", images: [current, next] });
			i += 2;
		} else {
			groups.push({ type: "single", images: [current] });
			i += 1;
		}
	}
	return groups;
}

/** Products — 作品詳情頁，不接受任何 props（資料由路由參數 :key 決定）。 */
const Products = () => {
	const { key } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const fromGallery = location.state?.from === "gallery";

	// 直接由路由參數推導，不另存 state。
	// 原本用 useState + useEffect 同步這份資料，除了多一次 render 之外，
	// 遇到不存在的 key 時會把 undefined 寫進 state，下一行解構就整頁白畫面。
	const product = PRODUCT_DATA.find((p) => p.key === key);

	// 目前展開的投影片索引；CLOSED 表示關閉
	const [slide, setSlide] = useState(CLOSED);
	const galleryRef = useRef(null);

	// 首圖與詳情圖串成單一序列並標上索引 —— Lightbox 的投影片順序、
	// 以及點擊哪張就從哪張打開，都依賴這個索引。
	const shots = useMemo(() => {
		if (!product) return [];
		return [...product.homeImages, ...product.images].map((img, index) => ({
			...img,
			index,
		}));
	}, [product]);

	const blocks = useMemo(() => groupImages(shots), [shots]);

	// 每件作品各有自己的標題與描述。呼叫點在 !product 的提早 return 之前 ——
	// hook 的呼叫順序不能隨條件變動。
	usePageMeta(
		product
			? {
					title: `${product.title} — Shane Lin`,
					description: `${product.category}｜${product.customer}。Shane Lin 的作品案例，共 ${shots.length} 張圖。`,
			  }
			: { title: "Project not found — Shane Lin" }
	);

	// 切換作品時回到頂部，並收起可能還開著的 Lightbox
	useEffect(() => {
		window.scrollTo(0, 0);
		setSlide(CLOSED);
	}, [key]);

	// 圖片進場：捲入視野才淡入。
	// 原本用 AOS，但整個專案只有這一頁在用它 —— 為了一個淡入效果載入
	// 一整套函式庫並不划算，改用與 ScrollRail、Form 相同的 IntersectionObserver。
	useEffect(() => {
		const root = galleryRef.current;
		if (!root) return;

		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;
		const figures = root.querySelectorAll(".detail__figure");

		if (reduceMotion) {
			figures.forEach((el) => el.classList.add("is-in"));
			return;
		}

		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					entry.target.classList.add("is-in");
					io.unobserve(entry.target); // 進場只播一次，播完就不再觀察
				});
			},
			{ rootMargin: "0px 0px -12% 0px" }
		);
		figures.forEach((el) => io.observe(el));
		return () => io.disconnect();
	}, [key]);

	const handleBack = () => navigate(fromGallery ? "/gallery" : "/");

	// 不存在的 key 不該讓整頁掛掉
	if (!product) {
		return (
			<main className="container detail detail--missing">
				<p className="detail__missing-index">(404)</p>
				<h1 className="detail__title">Project not found</h1>
				<Link className="detail__back-link" to="/">
					← Back to index
				</Link>
			</main>
		);
	}

	const order = PRODUCT_DATA.indexOf(product);
	const next = PRODUCT_DATA[(order + 1) % PRODUCT_DATA.length];

	/**
	 * 單張圖片。包在 <button> 而非直接綁 onClick 於 <img> ——
	 * 後者鍵盤無法聚焦也無法觸發，等於這頁的放大功能只有滑鼠使用者能用。
	 *
	 * @param {{shot: object, eager: boolean}} props
	 */
	const Shot = ({ shot, eager }) => (
		<button
			type="button"
			className="detail__shot"
			onClick={() => setSlide(shot.index)}
			aria-label={`放大檢視 ${product.title} 第 ${shot.index + 1} 張，共 ${shots.length} 張`}
		>
			<img
				src={shot.src}
				alt={`${product.title}（圖 ${shot.index + 1}）`}
				// width / height 讓瀏覽器在圖片下載前就依比例預留空間，消除版面位移
				width={shot.w}
				height={shot.h}
				// 首圖在首屏，優先下載；其餘延後到接近視野才載
				loading={eager ? "eager" : "lazy"}
				fetchpriority={eager ? "high" : "auto"}
				decoding="async"
				draggable="false"
			/>
		</button>
	);

	return (
		<main className="detail">
			<div className="container">
				<button type="button" className="detail__back-link" onClick={handleBack}>
					← {fromGallery ? "Gallery" : "Index"}
				</button>

				<header className="detail__head">
					<span className="detail__index">
						({String(order + 1).padStart(2, "0")})
					</span>
					<h1 className="detail__title">{product.title}</h1>

					{/* dl 而非 ul：原本標籤與內容是彼此無關的並列 <li>，
					    輔助技術會讀成六個獨立項目，讀不出「Client 對應某某」的關係。 */}
					<dl className="detail__meta">
						<div className="detail__meta-row">
							<dt>Category</dt>
							<dd>{product.category}</dd>
						</div>
						<div className="detail__meta-row">
							<dt>Client</dt>
							<dd>{product.customer}</dd>
						</div>
						{/* 只有線上看得到成品的作品（如網站）才有 link，其餘作品不長出這一列 */}
						{product.link && (
							<div className="detail__meta-row">
								<dt>Site</dt>
								<dd>
									<a href={product.link.href} target="_blank" rel="noreferrer">
										{product.link.label} ↗
									</a>
								</dd>
							</div>
						)}
						<div className="detail__meta-row">
							<dt>Designer</dt>
							<dd>
								<a
									href="https://www.instagram.com/__ssshane/"
									target="_blank"
									rel="noreferrer"
								>
									Shane Lin ↗
								</a>
							</dd>
						</div>
						<div className="detail__meta-row">
							<dt>Frames</dt>
							<dd>{String(shots.length).padStart(2, "0")}</dd>
						</div>
					</dl>
				</header>

				<div className="detail__gallery" ref={galleryRef}>
					{blocks.map((group) =>
						group.type === "pair" ? (
							<div className="detail__figure detail__pair" key={group.images[0].id}>
								{group.images.map((shot) => (
									<Shot key={shot.id} shot={shot} eager={false} />
								))}
							</div>
						) : (
							<div className="detail__figure" key={group.images[0].id}>
								<Shot shot={group.images[0]} eager={group.images[0].index === 0} />
							</div>
						)
					)}
				</div>

				<nav className="detail__next" aria-label="Next project">
					<span className="detail__next-cap">Next project</span>
					<Link className="detail__next-link" to={`/detail/${next.key}`}>
						{next.title}
						<span aria-hidden="true"> →</span>
					</Link>
				</nav>
			</div>

			<Lightbox
				open={slide >= 0}
				index={slide < 0 ? 0 : slide}
				close={() => setSlide(CLOSED)}
				slides={shots.map((shot) => ({
					src: shot.src,
					width: shot.w,
					height: shot.h,
					alt: `${product.title}（圖 ${shot.index + 1}）`,
				}))}
				plugins={[Zoom]}
			/>
		</main>
	);
};

export default Products;
