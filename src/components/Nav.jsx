/**
 * @file Nav.jsx
 * @description 導覽組件。採 specia1ne 式的 Menu / Close 操作邏輯：
 *   頂部固定一條極簡列（左：品牌字標，右：Menu 開關），點擊後展開全螢幕
 *   編號選單（01 Index … 05 Contact，另含 Gallery）。選單以區塊 id 做錨點跳轉，
 *   跨頁時先返回首頁再捲動。接收 activeSection 以高亮當前區塊。
 */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/shhh-logo.png";

/** 首頁各區塊：num 編號、name 對應區塊 id、label 顯示字、meta 右側描述。 */
const SECTIONS = [
  { num: "01", name: "index", label: "Index", meta: "Introduction" },
  { num: "02", name: "work", label: "Work", meta: "Selected projects" },
  { num: "03", name: "practice", label: "Practice", meta: "Capabilities" },
  { num: "04", name: "about", label: "About", meta: "Profile" },
  { num: "05", name: "contact", label: "Contact", meta: "Get in touch" },
];

/**
 * Nav — 頂部列 + 全螢幕選單
 *
 * @param {string} activeSection - 當前可見區塊（'index' | 'work' | 'contact'）
 */
function Nav({ activeSection }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // 選單開啟時鎖定背景捲動
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // 路由切換時自動收起選單
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  /**
   * go — 跳轉至首頁指定區塊。
   * 若已在首頁則直接平滑捲動至該 id；否則導回首頁並帶上 scrollTarget，
   * 由 App 的捲動效果接手定位。
   *
   * @param {string} name - 區塊 id（index / work / practice / about / contact）
   */
  const go = (name) => {
    setOpen(false);
    if (location.pathname === "/") {
      if (name === "index") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById(name)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/", { state: { scrollTarget: name } });
    }
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner container">
          <Link to="/" className="brand" onClick={() => go("index")}>
            <img src={logo} alt="logo" className="brand_logo" />
            {/* <span>Shane&nbsp;Lin</span> */}
            <span className="brand__mark">/ folio</span>
          </Link>
          <button
            type="button"
            className={`menu-toggle ${open ? "is-open" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <div className={`menu-overlay ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="menu-cap">
          <span>Navigation</span>
          <span>{String(SECTIONS.length + 1).padStart(2, "0")} destinations</span>
        </div>

        <ul className="menu-list">
          {SECTIONS.map((s) => (
            <li className="menu-item" key={s.name}>
              <button
                type="button"
                className={`menu-link ${activeSection === s.name ? "active" : ""}`}
                onClick={() => go(s.name)}
              >
                <span className="menu-link__num">{s.num}</span>
                <span className="menu-link__label">{s.label}</span>
                <span className="menu-link__meta">{s.meta}</span>
                <span className="menu-link__arrow" aria-hidden="true">→</span>
              </button>
            </li>
          ))}
          <li className="menu-item">
            <Link
              to="/gallery"
              className={`menu-link ${location.pathname === "/gallery" ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className="menu-link__num">06</span>
              <span className="menu-link__label">Gallery</span>
              <span className="menu-link__meta">Full archive</span>
              <span className="menu-link__arrow" aria-hidden="true">↗</span>
            </Link>
          </li>
        </ul>

        <div className="menu-foot">
          <span>Based in Taiwan — Available for work</span>
          <span>
            <a target="_blank" rel="noreferrer" href="https://www.instagram.com/__ssshane/">
              Instagram
            </a>
            &nbsp;/&nbsp;
            <a target="_blank" rel="noreferrer" href="https://github.com/sam6091260">
              GitHub
            </a>
          </span>
        </div>
      </div>
    </>
  );
}

export default Nav;
