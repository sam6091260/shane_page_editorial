/**
 * @file Form.jsx
 * @description 聯絡區塊（05 / Contact）。編輯式極簡表單：大字方括號標題 ＋
 *   name / email / message 欄位。透過 axios POST 送至郵件中繼服務，
 *   提交期間顯示 Loading，完成後以 react-hot-toast 回饋結果。
 */
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Loading from "./Loading";

/** 標題展開的觸發門檻：露出這個比例才播，避免擦邊而過就演完了 */
const REVEAL_AT = 0.35;

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
	 * handleSubmit — 提交表單，POST 至郵件 API，成功後清空欄位並顯示 toast。
	 * @param {React.FormEvent} e - 表單提交事件
	 */
	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const response = await axios.post(
				"https://polar-thicket-73181-a753805e876d.herokuapp.com/send-email",
				{ ...formData }
			);
			toast.success(response.data.message);
			setFormData({ name: "", email: "", message: "" });
		} catch (error) {
			toast.error(error?.response?.data?.message || "Something went wrong.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section className="container section" id="contact" ref={formRef}>
			<div className="section-head">
				<span className="section-head__index">(05)</span>
				<span className="section-head__label">Contact</span>
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

			{isLoading ? (
				<div style={{ minHeight: "200px" }}>
					<Loading />
				</div>
			) : (
				<form className="form" onSubmit={handleSubmit}>
					<div className="form__field">
						<label htmlFor="name">Name</label>
						<input
							type="text"
							id="name"
							name="name"
							placeholder="Your name"
							value={formData.name}
							onChange={handleChange}
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
						></textarea>
					</div>
					<div className="form__submit">
						<button type="submit">Send message</button>
					</div>
				</form>
			)}
		</section>
	);
}

export default Form;
