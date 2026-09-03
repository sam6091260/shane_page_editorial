/**
 * @file usePageMeta.js
 * @description 依當前頁面覆寫 <title> 與 meta description，離開該頁時還原。
 *
 *   路由改用 BrowserRouter 之後，作品頁與 Gallery 都是獨立網址，
 *   理應各有自己的標題 —— 否則分頁列、書籤、搜尋結果上五件作品長得一模一樣。
 *
 *   ⚠ 這是純前端的覆寫，能吃到的對象有限：
 *   Google 會執行 JavaScript，讀得到這裡設的值；
 *   但 LINE、Facebook 的爬蟲不執行 JS，分享預覽卡仍會顯示 index.html
 *   裡那組站台層級的 og:title / og:image。要讓每件作品有自己的預覽圖，
 *   得在建置階段預先產出各頁的 HTML（prerender），那是另一個層級的改動。
 */
import { useEffect } from "react";

/**
 * 取得（必要時建立）<meta name="description">。
 * index.html 一定有這個標籤，建立的分支只是防止哪天被拿掉就整個壞掉。
 */
function descriptionTag() {
	let tag = document.querySelector('meta[name="description"]');
	if (!tag) {
		tag = document.createElement("meta");
		tag.setAttribute("name", "description");
		document.head.appendChild(tag);
	}
	return tag;
}

/**
 * usePageMeta — 掛載期間套用頁面層級的 meta，卸載時還原。
 *
 * 還原值在 effect 內即時讀取而非模組載入時取一次 —— 詳情頁是 lazy load，
 * 模組真正被載入的時間點不固定，此時的 document.title 未必還是初始值。
 *
 * @param {{title?: string, description?: string}} meta
 */
export default function usePageMeta({ title, description } = {}) {
	useEffect(() => {
		const tag = descriptionTag();
		const prevTitle = document.title;
		const prevDescription = tag.getAttribute("content");

		if (title) document.title = title;
		if (description) tag.setAttribute("content", description);

		return () => {
			document.title = prevTitle;
			if (prevDescription !== null) tag.setAttribute("content", prevDescription);
		};
	}, [title, description]);
}
