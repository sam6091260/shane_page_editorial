/**
 * @file Footer.jsx
 * @description 頁尾組件。極簡排版：LOGO（點擊回頂）＋ 文字式社群連結，
 *   下方為版權與製作署名。
 */
import logo from "../assets/shhh-logo.png";
import { Link } from "react-router-dom";

/** Footer — 頁尾，不接受任何 props。 */
function Footer() {
	/** handleLogoClick — 點擊 LOGO 平滑捲動至頁面頂部 */
	const handleLogoClick = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<footer>
			<div className="footer-inner">
				<div className="footer-top">
					<Link to="/" onClick={handleLogoClick}>
						<img src={logo} alt="logo" className="logo" />
					</Link>
					<div className="tag">
						<a target="_blank" rel="noreferrer" href="https://www.instagram.com/__ssshane/">
							Instagram
						</a>
						<a target="_blank" rel="noreferrer" href="https://www.facebook.com/fan.shian/">
							Facebook
						</a>
						<a target="_blank" rel="noreferrer" href="https://github.com/sam6091260">
							GitHub
						</a>
					</div>
				</div>
				<div className="footer-bottom">
					<p>Copyright © Shane Design. All rights reserved.</p>
					<p>Powered by Shane Lin</p>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
