import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

function GlobalStyles() {
  return (
    <style>{`
      html, body, #root {
        height: 100%;
        width: 100%;
        margin: 0;
      }
      body {
        background: #050812;
        color: #fff;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      }
      * { box-sizing: border-box; }
      a { color: inherit; }
      input, button, textarea { font: inherit; }
    `}</style>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalStyles />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);