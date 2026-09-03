/**
 * @file Form.jsx
 * @description 聯絡區塊（05 / Contact）。編輯式極簡表單：大字方括號標題 ＋
 *   name / email / message 欄位。透過 axios POST 送至 Formspree，
 *   提交期間停用欄位並跑一條進度條，完成後以 react-hot-toast 回饋結果。
 */
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";

/** 標題展開的觸發門檻：露出這個比例才播，避免擦邊而過就演完了 */
const REVEAL_AT = 0.35;

/**
 * 收件端點。用 Formspree 而非自架後端 —— 寄信需要 SMTP 帳密，
 * 而帳密不能出現在前端，過去為此掛了一台 Heroku 中繼站；
 * 免費方案終止後那台停機，表單靜默壞掉了一段時間都沒人察覺。
 * 交給託管服務就沒有「自己的伺服器會不會掛」這個問題。
 */
const ENDPOINT = "https://formspree.io/f/mdeozwlp";

/**
 * Form — 聯絡表單
 *
 * @param {React.RefObject} formRef - 父層傳入的 ref，供捲動偵測定位
 */
function Form({ formRef }) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({ name: "", email: "", message: "" });

	// 標題的方括號展開動畫：捲入視野時加上 is-revealed，其餘交給 CSS。
	// 「減少動態效果」時直接以展開狀態初始化，不做過場。
	const headRef = useRef(null);
	const reduceMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)"
	).matches;
	const [revealed, setRevealed] = useState(reduceMotion);

	useEffect(() => {
		const el = headRef.current;
		if (!el || reduceMotion) return;

		const io = new IntersectionObserver(
			([entry]) => {
				// 兩段門檻做遲滯（hysteresis）：露出三分之一才展開，
				// 但要完全離開視野才收回。
				//
				// 若展開與收合共用同一個門檻，使用者在該門檻附近微幅捲動時，
				// 括號會反覆開合閃爍 —— 這是捲動觸發動畫最常見的毛病。
				// 把「開」與「關」的條件拉開，中間就有一段互不干擾的緩衝區。
				if (entry.intersectionRatio >= REVEAL_AT) setRevealed(true);
				else if (!entry.isIntersecting) setRevealed(false);
			},
			// 兩個門檻都要註冊，否則跨越時不會收到通知
			{ threshold: [0, REVEAL_AT] }
		);
		io.observe(el);
		return () => io.disconnect();
	}, [reduceMotion]);

	/**
	 * handleChange — 通用輸入處理，依 name 動態更新對應欄位。
	 * @param {React.ChangeEvent} e - 輸入事件
	 */
	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	/**
	 * handleSubmit — 提交表單，POST 至 Formspree，成功後清空欄位並顯示 toast。
	 * @param {React.FormEvent} e - 表單提交事件
	 */
	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			await axios.post(ENDPOINT, formData, {
				// 少了這個標頭，Formspree 會回傳一頁 HTML 的感謝頁而不是 JSON，
				// 前端就拿不到可判讀的結果。
				headers: { Accept: "application/json" },
			});
			toast.success("訊息已送出，我會盡快回覆你。");
			setFormData({ name: "", email: "", message: "" });
		} catch (error) {
			// Formspree 的錯誤放在 errors 陣列裡，逐項都是可直接顯示的句子
			const detail = error?.response?.data?.errors
				?.map((err) => err.message)
				.join("；");
			toast.error(detail || "送出失敗，請稍後再試，或直接私訊 Instagram。");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section className="container section" id="contact" ref={formRef}>
			<div className="section-head">
				<span className="section-head__index">(05)</span>
				<h2 className="section-head__label">Contact</h2>
				<span className="section-head__meta">Let&apos;s talk</span>
			</div>

			{/* 方括號之間的內容包在一個可收合的 grid 容器裡。
			    收合時寬度為 0，兩個括號自然併攏；展開時被文字推開。
			    原本寫在括號上的空白改用 &nbsp; 移進容器內，否則收合後仍會留一段空隙。 */}
			<h2
				className={`contact__head${revealed ? " is-revealed" : ""}`}
				ref={headRef}
			>
				<span className="bracket">[</span>
				<span className="contact__head-reveal">
					<span>
						&nbsp;Get in<span className="accent"> touch</span>&nbsp;
					</span>
				</span>
				<span className="bracket">]</span>
			</h2>

			{/* 傳送期間不卸載表單 —— 整塊消失會讓人以為剛打的字沒了，
			    而且失敗時畫面會再閃回來一次。改為停用欄位，
			    在送出列上方跑一條進度條表示還在處理。 */}
			<form className="form" onSubmit={handleSubmit} aria-busy={isLoading}>
				<div className="form__field">
					<label htmlFor="name">Name</label>
					<input
						type="text"
						id="name"
						name="name"
						placeholder="Your name"
						value={formData.name}
						onChange={handleChange}
						disabled={isLoading}
						required
					/>
				</div>
				<div className="form__field">
					<label htmlFor="email">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						placeholder="you@email.com"
						value={formData.email}
						onChange={handleChange}
						disabled={isLoading}
						required
					/>
				</div>
				<div className="form__field is-wide">
					<label htmlFor="message">Message</label>
					<textarea
						id="message"
						name="message"
						placeholder="Tell me about your project"
						value={formData.message}
						onChange={handleChange}
						disabled={isLoading}
						required
					></textarea>
				</div>

				{/* 常駐於 DOM、僅切換透明度 —— 條件式插入會讓下方的送出列
				    在傳送開始的瞬間被推下去，出現一次位移。 */}
				<div className="form__progress" data-active={isLoading} aria-hidden="true">
					<span />
				</div>

				<div className="form__submit">
					<button type="submit" disabled={isLoading}>
						{isLoading ? "Sending" : "Send message"}
					</button>
				</div>
			</form>
		</section>
	);
}

export default Form;
