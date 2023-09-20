import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";

addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(<App />);
  }
});
