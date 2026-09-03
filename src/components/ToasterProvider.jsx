/**
 * @file ToasterProvider.jsx
 * @description 封裝 react-hot-toast 的 Toaster，集中在根組件掛載一次，
 *   供全站的 toast() 呼叫使用。
 *
 *   樣式在此統一覆寫：套件預設是白底圓角的通用樣式，與站上黑底、細線、
 *   等寬字的編輯式調性完全不同 —— 通知一跳出來就像是別的網站的元件。
 *   顏色一律讀 CSS 變數，改動設計代幣時通知會跟著變，不會兩邊各走各的。
 */
import { Toaster } from "react-hot-toast";

import React from "react";

/** 通知的共用外觀。字體用 sans —— mono 沒有中文字符，訊息是中文的。 */
const TOAST_STYLE = {
  background: "var(--bg-elev)",
  color: "var(--fg)",
  border: "1px solid var(--line-strong)",
  borderRadius: "2px",
  padding: "14px 18px",
  fontFamily: "var(--font-sans)",
  fontSize: "14px",
  lineHeight: 1.5,
  letterSpacing: "0.01em",
  maxWidth: "380px",
  boxShadow: "0 18px 44px rgba(0, 0, 0, 0.55)",
};

/** 成功與失敗共用橘色圖示 —— 站上只有一個強調色，通知不該自己多帶一組紅綠。 */
const ICON_THEME = { primary: "var(--accent)", secondary: "var(--bg)" };

/** ToasterProvider — 封裝層，不接受任何 props。 */
const ToasterProvider = () => {
  return (
    <Toaster
      // 右下角而非預設的頂端置中：頂端有固定的 site-header，通知會疊上去；
      // 而且表單本身在頁面底部，回饋出現在視線附近才看得到。
      position="bottom-right"
      gutter={12}
      toastOptions={{
        duration: 4200,
        style: TOAST_STYLE,
        success: { iconTheme: ICON_THEME },
        // 失敗留久一點：裡面通常有使用者需要照著處理的資訊
        error: { duration: 6500, iconTheme: ICON_THEME },
      }}
    />
  );
};

export default ToasterProvider;
