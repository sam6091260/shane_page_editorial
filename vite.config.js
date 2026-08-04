import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages 是專案子路徑（/shane_page_editorial/），Netlify 則發在網域根目錄。
  // Netlify 在建置時會自動注入 NETLIFY=true，據此切換即可讓同一份 repo
  // 同時供兩邊部署 —— 忘了改 base 的話，所有 JS/CSS/圖片都會 404，畫面全白。
  base: process.env.NETLIFY ? "/" : "/shane_page_editorial/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
