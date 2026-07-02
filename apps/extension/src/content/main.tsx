import ReactDOM from "react-dom/client";
import { App } from "./App";
import styles from "./styles.css?inline";

const ROOT_ID = "genchat-extension-root";

function mount() {
  if (document.getElementById(ROOT_ID)) {
    return;
  }

  const host = document.createElement("div");
  host.id = ROOT_ID;
  const shadow = host.attachShadow({ mode: "open" });
  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  const container = document.createElement("div");
  container.className = "genchat-root";
  shadow.append(styleElement, container);
  document.documentElement.append(host);
  ReactDOM.createRoot(container).render(<App />);
}

mount();
