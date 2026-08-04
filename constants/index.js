/**
 * @file constants/index.js
 * @description 全局静態資料層。萬集所有作品的元資料與圖片資産。
 *   此檔為整個專案的單一真相來源（Single Source of Truth），
 *   Work、Gallery、Products 等頁面均從此讀取數據。
 */
import post1 from "../src/assets/post.png";
import post2 from "../src/assets/detail/poster1.jpg";
import post3 from "../src/assets/detail/poster2.jpg";
import mamba1 from "../src/assets/mamba.png";
import mamba2 from "../src/assets/detail/mamba1.jpg";
import mamba3 from "../src/assets/detail/mamba2.jpg";
import mamba4 from "../src/assets/detail/mamba3.jpg";
import fangzui1 from "../src/assets/fengzui.jpg";
import fangzui2 from "../src/assets/fengzui2.jpg";
import fangzui3 from "../src/assets/detail/fangzui1.jpg";
import fangzui4 from "../src/assets/detail/fangzui2.jpg";
import fangzui5 from "../src/assets/detail/fangzui3.jpg";
import fangzui6 from "../src/assets/detail/fangzui4.jpg";
import tumaz from "../src/assets/tumaz.jpg";
import tumaz1 from "../src/assets/detail/tumaz1.jpg";
import tumaz2 from "../src/assets/detail/tumaz2.jpg";
import tumaz3 from "../src/assets/detail/tumaz3.jpg";

/**
 * PRODUCT_DATA — 全部作品的元資料陣列
 *
 * w / h 是圖片的原始像素尺寸。詳情頁把它們輸出成 <img> 的 width / height 屬性，
 * 瀏覽器據此在圖片下載完成前就預留正確的版面空間 —— 少了這兩個值，
 * 每張圖載入時都會把下方內容往下推（CLS），在以圖片為主的頁面上格外明顯。
 * 新增圖片時務必一併填上，可用 ffprobe 或系統的檔案內容選項查得。
 *
 * @type {Array<{
 *   key: string,        - 路由定位用的唯一鍵（如 'tumaz'、'poster'、'mamba'、'fangzui'）
 *   title: string,     - 展示用的作品標題
 *   category: string,  - 設計類型（如 'Logo / Brand / Font'）
 *   customer: string,  - 客戶名稱與年份
 *   homeImages: Array<{id: string, src: string, w: number, h: number}>,  - 首頁作品地圖（可多張）
 *   images: Array<{id: string, src: string, w: number, h: number, style?: 'postTwo'}>  - 詳情頁圖片（style='postTwo' 表示兩張並排組合）
 * }>}
 */
export const PRODUCT_DATA = [
  {
    key: "tumaz",
    title: "tumaz apparel | 像素熊設計",
    category: "Pixel Art",
    customer: "Tumaz Apparel 2024",
    homeImages: [{ id: "tumaz", src: tumaz, w: 3240, h: 1080 }],
    images: [
      { id: "tumaz1", src: tumaz1, w: 1080, h: 1080, style: "postTwo" },
      { id: "tumaz2", src: tumaz2, w: 1080, h: 1080, style: "postTwo" },
      { id: "tumaz3", src: tumaz3, w: 1080, h: 1080 },
    ],
  },
  {
    key: "poster",
    title: "basketball team | 籃球隊海報設計",
    category: "Flyer",
    customer: "New Taipei City HaiShan Basketball team 2021-2022",
    homeImages: [{ id: "post1", src: post1, w: 3240, h: 1080 }],
    images: [
      { id: "post2", src: post2, w: 5000, h: 3337 },
      { id: "post3", src: post3, w: 3000, h: 2250 },
    ],
  },
  {
    key: "mamba",
    title: "fried chicken shop | 品牌商標設計",
    category: "Logo / Brand / Font",
    customer: "Mamba Chicken Shop 2021",
    homeImages: [{ id: "mamba1", src: mamba1, w: 3240, h: 1080 }],
    images: [
      { id: "mamba2", src: mamba2, w: 1916, h: 814 },
      { id: "mamba3", src: mamba3, w: 1080, h: 1080, style: "postTwo" },
      { id: "mamba4", src: mamba4, w: 1400, h: 1400, style: "postTwo" },
    ],
  },
  {
    key: "fangzui",
    title: "fangzui tea | 品牌識別設計",
    category: "Logo / VI / Menu",
    customer: "Fangzui Tea Shop 2020",
    homeImages: [
      { id: "fangzui1", src: fangzui1, w: 3240, h: 1080 },
      { id: "fangzui2", src: fangzui2, w: 3240, h: 1080 },
    ],
    images: [
      { id: "fangzui3", src: fangzui3, w: 1080, h: 1080, style: "postTwo" },
      { id: "fangzui4", src: fangzui4, w: 1841, h: 1841, style: "postTwo" },
      { id: "fangzui5", src: fangzui5, w: 3000, h: 2250 },
      { id: "fangzui6", src: fangzui6, w: 3000, h: 2250 },
    ],
  },
];
