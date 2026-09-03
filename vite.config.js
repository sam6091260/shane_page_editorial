import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // 站點只發在 Netlify 的網域根目錄，因此固定為 "/"。
  // 先前為了同時供 GitHub Pages（專案子路徑）部署而依 NETLIFY 環境變數切換；
  // 兩邊內容相同會造成重複內容，且子路徑部署與 BrowserRouter 相衝，已停用。
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
