import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { App } from "./app";

const rootEl = document.querySelector("#root");

if (rootEl) {
  const root = createRoot(rootEl);
  root.render(
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <App />
      </ThemeProvider>
    </StrictMode>,
  );
}
