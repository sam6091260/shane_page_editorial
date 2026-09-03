/**
 * @file main.jsx
 * @description 應用程式入口。掛載 React 根節點與 BrowserRouter 路由容器。
 *
 *              捲動進場動畫改由各元件自行以 IntersectionObserver 實作
 *              （Products、Form、ScrollRail），不再依賴 AOS。
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
