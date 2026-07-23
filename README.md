<h1>Shane Lin — Editorial Portfolio</h1>

作品集網站的**編輯式極簡（editorial minimal）**版本，深色調、編號分區、Menu/Close 導覽，
風格參考 [specia1ne.com](https://specia1ne.com/) 的操作邏輯與排版節奏。

> 這是 `shane_page` 的獨立版本。原本的活潑／霓虹風格版本仍保留在原 repo：
> https://github.com/sam6091260/shane_page

-----------------------------------------------

## 設計特點
- **深色編輯式極簡**：近黑底 `#0b0b0c` + 微光字，單一暖色 `#ea5413` 作極少量點綴。
- **編號分區**：首頁分為 `(01) Signal → (02) Selected Work → (03) Practice → (04) About → (05) Contact`。
- **Menu / Close 導覽**：全螢幕編號選單，逐項進場、hover 聚焦（該項變白、其餘變暗）。
- **作品索引列**：序號 + 標題/類型 + 客戶年份，hover 展開首圖預覽。
- **排版系統**：Futura 作大字顯示、JetBrains Mono 作編號/技術標籤、sans 作內文；`clamp()` 流體字級。

## 技術堆疊
- React 18 + React Router v6
- Vite（建置工具）
- Sass / SCSS（原生由 Vite 編譯，直接 `import` `.scss`）
- Three.js / Framer Motion / AOS（保留於相依，部分視覺已簡化）
- yet-another-react-lightbox（作品詳情圖片檢視）
- react-hot-toast（表單通知）

## 開發
```bash
npm install
npm run dev      # 本地開發
npm run build    # 產出 dist/
npm run preview  # 預覽 build 結果
```

## 專案結構
- `src/components/` — Nav、Landing、Work、Skill(Practice)、About、Form(Contact)、Footer 等區塊
- `src/pages/` — Products（作品詳情）、Gallery（相簿）
- `src/styles/` — `App.scss`（設計系統）、`Detail.scss`（詳情頁）
- `constants/index.js` — 作品資料單一真相來源
