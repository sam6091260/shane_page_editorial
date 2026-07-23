/**
 * @file Form.jsx
 * @description 聯絡區塊（05 / Contact）。編輯式極簡表單：大字方括號標題 ＋
 *   name / email / message 欄位。透過 axios POST 送至郵件中繼服務，
 *   提交期間顯示 Loading，完成後以 react-hot-toast 回饋結果。
 */
import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Loading from "./Loading";

/**
 * Form — 聯絡表單
 *
 * @param {React.RefObject} formRef - 父層傳入的 ref，供捲動偵測定位
 */
function Form({ formRef }) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({ name: "", email: "", message: "" });

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

			<h2 className="contact__head">
				<span className="bracket">[ </span>Get in<span className="accent"> touch</span>
				<span className="bracket"> ]</span>
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
