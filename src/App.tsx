import React from "react";
import ReactDOM from "react-dom/client";
import GraphPage from "./pages/GraphPage.js";

ReactDOM
    .createRoot(document.getElementById("root") as HTMLElement)
    .render(<React.StrictMode><GraphPage /></React.StrictMode>);
